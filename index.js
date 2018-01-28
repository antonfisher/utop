'use strict';

const commander = require('commander');
const version = require('./package.json').version;

const DEFAULT_UPDATE_INTERVAL_SECONDS = 1;

let userCommand;
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

console.log('-- RUN', commander.interval, userCommand, userCommandOptions);
