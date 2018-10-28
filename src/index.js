'use strict';

//polyfills
require('core-js/fn/string/pad-start');

const {resolve} = require('path');

const {version, description, homepage} = require('../package.json');
const StatsCollector = require('./modules/StatsCollector');
const parseCliArgs = require('./helpers/parseCliArgs');
const UserProcess = require('./modules/UserProcess');
const UIRenderer = require('./modules/UIRenderer');

const DEMO_SCRIPT_PATH = resolve(__dirname, '../tests/scriptDemoPrintDate.js');

let uiRenderer;
let userProcess;
let statsCollector;
let killing = false;
let killingAttempts = 0;

function exitProcess(err) {
  if (err) {
    console.log('ERROR:', err); //TODO red
  }

  if (killing && killingAttempts > 2) {
    console.log(`Force process exit. Subprocess PID is ${userProcess.process.pid}.`); //TODO red
    process.exit();
  }
  killing = true;
  killingAttempts++;

  if (statsCollector) {
    statsCollector.destroy();
  }
  if (uiRenderer) {
    uiRenderer.destroy();
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

  uiRenderer = new UIRenderer({
    command: options.demo ? '[UTop DEMO]' : userCommand.fullCommand,
    chartHeight: options.chartHeight,
    version
  })
    .on('exit', () => exitProcess())
    .render();

  userProcess = new UserProcess(userCommand)
    .on('stdout', (message) => uiRenderer.addLog(message))
    .on('stderr', (message) => uiRenderer.addError(message))
    .on('error', (message) => {
      uiRenderer.addError(message);
      if (statsCollector) {
        setTimeout(() => statsCollector.destroy(), options.interval);
      }
    })
    .on('exit', (code) => {
      const message = `Child process exited with code: ${code}, press Cmd-C to close UTop.`;
      uiRenderer.stopTimer();
      if (code === 0) {
        uiRenderer.addLog('');
        uiRenderer.addLog(message); //TODO green
      } else {
        uiRenderer.addError(message);
      }
      if (statsCollector) {
        setTimeout(() => statsCollector.destroy(), options.interval);
      }
    })
    .run();

  uiRenderer.setPid(userProcess.process.pid);

  statsCollector = new StatsCollector({
    pid: userProcess.process.pid,
    interval: options.interval
  }).on('stats', ({cpu, mem}) => uiRenderer.addCpu(cpu).addMem(mem));

  if (options.demo) {
    statsCollector.demo();
  } else {
    statsCollector.run();
  }

  process.on('SIGINT', () => exitProcess()).on('SIGTERM', () => exitProcess());
});
