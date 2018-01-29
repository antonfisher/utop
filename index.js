'use strict';

const {version, description} = require('./package.json');
const parseCliArgs = require('./src/parseCliArgs');
const UI = require('./src/UI');
const ChildProcess = require('./src/ChildProcess');

parseCliArgs({version, description}, ({userCommand, compact, interval}) => {
  const ui = new UI({
    command: userCommand.fullCommand,
    compact,
    version
  });

  const userProcess = new ChildProcess(userCommand);

  const processExit = (code = 0, message) => {
    ui.destroy();
    if (userProcess && !userProcess.killed) {
      userProcess.kill();
    }
    if (message) {
      console.log(message);
    }
    process.exit(code);
  };

  const printError = (err) => {
    ui.addLog('');
    //ui.addLog('ERROR:', {error: true});
    ui.addLog(err, {error: true});
  };

  ui.on('exit', () => processExit(0));
  ui.on('scrolledUp', () => userProcess.enableOutputBuffer());
  ui.on('scrolledDown', () => userProcess.disableOutputBuffer());

  userProcess.on('stdout', (output) => ui.addLog(output));
  userProcess.on('stderr', (err) => printError(err));
  userProcess.on('exit', (message) => printError(message));
  userProcess.on('error', (err) => printError(err));

  //test
  setInterval(() => ui.addCpu((Math.sin(+new Date() / 1000) + 1) / 2 * 100), interval * 1000);
  setInterval(() => ui.addMem(Math.random() * 100), interval * 1000);
});
