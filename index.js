#!/usr/bin/env node

'use strict';

const {resolve} = require('path');

const {version, description, homepage} = require('./package.json');
const StatsCollelector = require('./src/StatsCollelector');
const parseCliArgs = require('./src/parseCliArgs');
const UserProcess = require('./src/UserProcess');
const UILayout = require('./src/UILayout');

const DEMO_SCRIPT_PATH = resolve(__dirname, './tests/scriptDemoPrintDate.js');

let uiLayout;
let userProcess;
let statsCollelector;
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

  if (statsCollelector) {
    statsCollelector.destroy();
  }
  if (uiLayout) {
    uiLayout.destroy();
  }
  if (userProcess) {
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
    .on('exit', (message) => uiLayout.addError(message))
    .on('error', (message) => uiLayout.addError(message))
    .run();

  uiLayout.setPid(userProcess.process.pid);

  statsCollelector = new StatsCollelector({
    pid: userProcess.process.pid,
    interval: options.interval * 1000
  }).on('stats', ({cpu, mem}) => uiLayout.addCpu(cpu).addMem(mem));

  if (options.demo) {
    statsCollelector.demo();
  } else {
    statsCollelector.run();
  }

  process.on('SIGINT', () => exitProcess()).on('SIGTERM', () => exitProcess());
});
