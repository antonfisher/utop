'use strict';

const {spawn} = require('child_process');
const commander = require('commander');
const blessed = require('blessed');
const blessedContrib = require('blessed-contrib');
const version = require('./package.json').version;

const DEFAULT_UPDATE_INTERVAL_SECONDS = 1;

let userCommand;
let userFullCommand;
let userCommandOptions;

commander
  .description('Single command monitoring')
  .usage('[options] <command>')
  .option('-i, --interval <n>', 'update interval in seconds1', (i) => parseInt(i, 10), DEFAULT_UPDATE_INTERVAL_SECONDS)
  .version(version, '-v, --version')
  .arguments('<command> [options...]')
  .action((command, options) => {
    userCommand = command;
    userCommandOptions = options;
    userFullCommand = `${userCommand}${userCommandOptions.length ? ` ${userCommandOptions.join(' ')}` : ''}`;
  })
  .on('--help', () => {
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ utop npm start');
    console.log('    $ utop -i 3 node server.js');
    console.log('');
  });

commander.parse(process.argv);

if (!userCommand) {
  commander.help();
}

// UI
const screen = blessed.screen({smartCSR: true});

screen.title = `utop: ${userFullCommand}`;
screen.key(['escape', 'q', 'C-c'], function() {
  return process.exit(0);
});

function drawLine({label, ...rest}) {
  blessed.line({
    parent: screen,
    height: 1,
    top: 0,
    left: 0,
    label: ` ${label} `,
    orientation: 'horizontal',
    border: {
      type: 'line'
    },
    style: {
      fg: '#009900'
    },
    ...rest
  });
}

// ui - title
blessed.text({
  parent: screen,
  left: 0,
  top: 0,
  tags: true,
  content: `UTop: {bold}${userFullCommand}{/bold}{|}ver.${version}`
});

//ui - process cpu title
drawLine({
  top: 2,
  label: 'Process CPU'
});

//ui - process memory title
drawLine({
  top: 5,
  label: 'Process Memory'
});

//ui - log panel title
drawLine({
  top: 8,
  label: 'Process Log'
});

//ui - log panel
const uiLogPanel = blessed.log({
  parent: screen,
  top: 9,
  bottom: 0,
  left: 0,
  keys: true,
  mouse: true,
  scrollable: true,
  scrollbar: true,
  //border: {
  //  type: 'line'
  //},
  //label: ' Process Log ',
  style: {
    //border: {
    //  fg: '#009900',
    //},
    scrollbar: {
      bg: '#009900'
    }
  }
});

let doBufferOutput = false;
let maxScroll = 0;
uiLogPanel.on('scroll', () => {
  maxScroll = Math.max(maxScroll, uiLogPanel.getScroll());
});
uiLogPanel.on('wheeldown', () => {
  if (uiLogPanel.getScroll() === maxScroll) {
    doBufferOutput = false;
  }
});
uiLogPanel.on('wheelup', () => {
  if (uiLogPanel.getScroll() !== maxScroll) {
    doBufferOutput = true;
  }
});

screen.render();

// run user command
//console.log('-- RUN', commander.interval, userCommand, userCommandOptions, `->${userFullCommand}<-`);

const userProcess = spawn(userCommand, userCommandOptions);

let str = '';
let bufferedOutput = [];
userProcess.stdout.on('data', (data) => {
  str += data.toString();
  if (str.includes('\n')) {
    if (doBufferOutput) {
      bufferedOutput.push(str);
    } else {
      if (bufferedOutput.length > 0) {
        bufferedOutput.forEach((bufferedStr) => {
          uiLogPanel.log(bufferedStr.replace(/\n$/, ''));
        });
        bufferedOutput = [];
      }
      uiLogPanel.log(str.replace(/\n$/, ''));
    }
    str = '';
  }
});

userProcess.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`); //red color
});

userProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

userProcess.on('error', ({code}) => {
  if (code === 'ENOENT') {
    console.log(`Failed to run subprocess, try to run: "${userFullCommand}"`);
  } else {
    console.log(`Failed to run subprocess: ${code}`);
  }
});
