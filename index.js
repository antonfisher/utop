'use strict';

const {version, description} = require('./package.json');
const parseCliArgs = require('./src/parseCliArgs');
const UI = require('./src/ui');
const ChildProcess = require('./src/childProcess');

parseCliArgs({version, description}, ({userCommand}) => {
  const ui = new UI({
    command: userCommand.fullCommand,
    version
  });

  const userProcess = new ChildProcess(userCommand);

  const processExit = (code = 0, message) => {
    ui.destroy();
    userProcess.kill();

    if (message) {
      console.log(message);
    }

    process.exit(code);
  };

  ui.on('exit', () => processExit(0));
  ui.on('scrolledUp', () => userProcess.enableOutputBuffer());
  ui.on('scrolledDown', () => userProcess.disableOutputBuffer());

  userProcess.on('output', (output) => ui.addLog(output));
  userProcess.on('exit', (message) => processExit(0, message));
  userProcess.on('error', (err) => processExit(1, err));
});
