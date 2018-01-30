#!/usr/bin/env node

'use strict';

const os = require('os');
const psTree = require('ps-tree');
const pidUsage = require('pidusage');

const {version, description} = require('./package.json');
const parseCliArgs = require('./src/parseCliArgs');
const UI = require('./src/UI');
const UserProcess = require('./src/UserProcess');

parseCliArgs({version, description}, ({userCommand, compact, interval, demo}) => {
  let userProcess;

  const processExit = (code = 0, message) => {
    ui.destroy();
    userProcess.kill((err) => {
      if (err) {
        console.log(`Cannot kill subprocess, PID:${userProcess.process.pid}, error:`, err);
      }
      if (message) {
        console.log(message);
      }
      process.exit(code);
    });
  };

  const printError = (err) => {
    ui.addLog('');
    ui.addLog(err, {error: true});
  };

  const ui = new UI({
    command: demo ? '[UTop DEMO]' : userCommand.fullCommand,
    compact,
    version
  });

  if (demo) {
    userProcess = new UserProcess({
      command: 'node',
      args: ['./tests/scriptDemoPrintDate.js']
    });
    setInterval(() => ui.addCpu((Math.sin(+new Date() / 1000) + 1) / 2 * 100), interval * 1000);
    setInterval(() => ui.addMem(Math.random() * 100), interval * 1000);
  } else {
    userProcess = new UserProcess(userCommand);
    setInterval(() => {
      let totalCpu = 0;
      let totalMem = 0;

      psTree(userProcess.process.pid, (err, children) => {
        if (!err) {
          children.forEach(({PID}) => {
            pidUsage.stat(PID, (err, stat) => {
              if (!err) {
                totalCpu += stat.cpu;
                totalMem += Math.ceil(stat.memory / 1024 / 1024); //Mb
              }
            });
          });
        }
      });

      pidUsage.stat(userProcess.process.pid, (err, stat) => {
        if (!err) {
          totalCpu += stat.cpu;
          totalMem += Math.ceil(stat.memory / 1024 / 1024); //Mb
        }
      });

      setTimeout(() => {
        ui.addCpu(totalCpu / os.cpus().length);
        ui.addMem(totalMem);
      }, interval * 900);
    }, interval * 1000);
  }

  ui.on('exit', () => processExit());
  ui.on('scrolledUp', () => userProcess.enableOutputBuffer());
  ui.on('scrolledDown', () => userProcess.disableOutputBuffer());

  userProcess.on('stdout', (output) => ui.addLog(output));
  userProcess.on('stderr', (err) => printError(err));
  userProcess.on('exit', (message) => printError(message));
  userProcess.on('error', (err) => printError(err));

  process.on('SIGINT', () => processExit());
  process.on('SIGTERM', () => processExit());
});
