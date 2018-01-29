'use strict';

const commander = require('commander');

const DEFAULT_OPTION_INTERVAL = 1;

function parseCliArgs({version, description}, callback) {
  let userCommand = {};

  commander
    .description(description)
    .usage('[options] <command>')
    .option('-i, --interval <n>', 'update interval in seconds', (i) => parseFloat(i), DEFAULT_OPTION_INTERVAL)
    .option('-c, --compact', 'use compact layout')
    .option('--demo', 'run program in demo mode')
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

  if (!userCommand.command && !commander.demo) {
    commander.help();
  }

  process.nextTick(() =>
    callback({
      userCommand,
      interval: commander.interval,
      compact: commander.compact,
      demo: commander.demo
    })
  );
}

module.exports = parseCliArgs;
