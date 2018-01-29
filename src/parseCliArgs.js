'use strict';

const commander = require('commander');

const DEFAULT_UPDATE_INTERVAL_SECONDS = 1;

function parseCliArgs({version, description}, callback) {
  let userCommand = {};

  commander
    .description(description)
    .usage('[options] <command>')
    .option('-i, --interval <n>', 'update interval in seconds', (i) => parseInt(i, 10), DEFAULT_UPDATE_INTERVAL_SECONDS)
    .version(version, '-v, --version')
    .arguments('<command> [options...]')
    .action((command, args) => {
      userCommand = {
        command,
        args,
        fullCommand: `${command}${args.length ? ` ${args.join(' ')}` : ''}`
      };
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

  if (!userCommand.command) {
    commander.help();
  }

  process.nextTick(() =>
    callback({
      userCommand,
      interval: commander.interval
    })
  );
}

module.exports = parseCliArgs;
