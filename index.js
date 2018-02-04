#!/usr/bin/env node

'use strict';

const {resolve} = require('path');

const {version, description, homepage} = require('./package.json');
const StatsCollector = require('./src/StatsCollector');
const parseCliArgs = require('./src/parseCliArgs');
const UserProcess = require('./src/UserProcess');
const UILayout = require('./src/UILayout');

const DEMO_SCRIPT_PATH = resolve(__dirname, './tests/scriptDemoPrintDate.js');

let uiLayout;
let userProcess;
let statsCollector;
let killing = false;
let killingAtempts = 0;

function exitProcess(err) {
  if (err) {
    console.log('ERROR:', err); //TODO red
  }

  if (killing && killingAtempts > 2) {
    console.log(`Force process exit. Subprocess PID is ${userProcess.process.pid}.`); //TODO red
    process.exit();
  }
  killing = true;
  killingAtempts++;

  if (statsCollector) {
    statsCollector.destroy();
  }
  if (uiLayout) {
    uiLayout.destroy();
  }
  if (userProcess && userProcess.process.pid) {
    console.log(`Exiting subprocess, PID ${userProcess.process.pid}...`);
    userProcess.kill((err) => {
      if (err) {
        console.log(`Cannot kill subprocess, PID ${userProcess.process.pid}, error:`, err.toString()); //TODO red
      }
      process.exit(err ? 1 : 0);
    });
  } else {
    process.exit(err ? 1 : 0);
  }
}

process.on('unhandledRejection', exitProcess);
process.on('uncaughtException', exitProcess);

parseCliArgs({version, description, homepage}, ({parsedUserCommand, options}) => {
  let userCommand = parsedUserCommand;

  if (options.demo) {
    userCommand = {command: 'node', args: [DEMO_SCRIPT_PATH]};
  }

  uiLayout = new UILayout({
    command: options.demo ? '[UTop DEMO]' : userCommand.fullCommand,
    dashboard: options.dashboard,
    version
  })
    .on('exit', () => exitProcess())
    .render();

  userProcess = new UserProcess(userCommand)
    .on('stdout', (message) => uiLayout.addLog(message))
    .on('stderr', (message) => uiLayout.addError(message))
    .on('error', (message) => {
      uiLayout.addError(message);
      if (statsCollector) {
        setTimeout(() => statsCollector.destroy(), options.interval);
      }
    })
    .on('exit', (code) => {
      const message = `Child process exited with code: ${code}, press Cmd-C to close UTop.`;
      uiLayout.stopTimer();
      if (code === 0) {
        uiLayout.addLog('');
        uiLayout.addLog(message); //TODO green
      } else {
        uiLayout.addError(message);
      }
      if (statsCollector) {
        setTimeout(() => statsCollector.destroy(), options.interval);
      }
    })
    .run();

  uiLayout.setPid(userProcess.process.pid);

  statsCollector = new StatsCollector({
    pid: userProcess.process.pid,
    interval: options.interval
  }).on('stats', ({cpu, mem}) => uiLayout.addCpu(cpu).addMem(mem));

  if (options.demo) {
    statsCollector.demo();
  } else {
    statsCollector.run();
  }

  process.on('SIGINT', () => exitProcess()).on('SIGTERM', () => exitProcess());
});
