#!/usr/bin/env node

'use strict';

const pidUsage = require('pidusage');

const {version, description} = require('./package.json');
const parseCliArgs = require('./src/parseCliArgs');
const UI = require('./src/UI');
const ChildProcess = require('./src/ChildProcess');

parseCliArgs({version, description}, ({userCommand, compact, interval, demo}) => {
  let userProcess;

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
    ui.addLog(err, {error: true});
  };

  const ui = new UI({
    command: demo ? 'UTop {blink}DEMO{/blink}' : userCommand.fullCommand,
    compact,
    version
  });

  if (demo) {
    userProcess = new ChildProcess({
      command: 'node',
      args: ['./tests/scriptDemoPrintDate.js']
    });
    setInterval(() => ui.addCpu((Math.sin(+new Date() / 1000) + 1) / 2 * 100), interval * 1000);
    setInterval(() => ui.addMem(Math.random() * 100), interval * 1000);
  } else {
    userProcess = new ChildProcess(userCommand);
    setInterval(() => {
      pidUsage.stat(userProcess.pid, (err, stat) => {
        if (!err) {
          ui.addCpu(stat.cpu);
          ui.addMem(Math.ceil(stat.memory / 1024 / 1024)); //Mb
        }
      });
    }, interval * 1000);
  }

  ui.on('exit', () => processExit());
  ui.on('scrolledUp', () => userProcess.enableOutputBuffer());
  ui.on('scrolledDown', () => userProcess.disableOutputBuffer());

  userProcess.on('stdout', (output) => ui.addLog(output));
  userProcess.on('stderr', (err) => printError(err));
  userProcess.on('exit', (message) => printError(message));
  userProcess.on('error', (err) => printError(err));
});
