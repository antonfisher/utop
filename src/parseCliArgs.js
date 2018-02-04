'use strict';

const commander = require('commander');

const DEFAULT_OPTION_INTERVAL = 0.5;

function addRestParamsToArgs(command, parsedArgs, rawArgs) {
  let args = parsedArgs;
  const userCommandPosition = rawArgs.indexOf(command);
  if (parsedArgs.length === 0 && userCommandPosition < rawArgs.length - 1) {
    args = rawArgs.slice(userCommandPosition + 1);
  }
  return args;
}

function parseCliArgs({version, description, homepage}, callback) {
  let parsedUserCommand = {};

  commander
    .description(`${description} (${homepage})`)
    .usage('[options] <command>')
    .option(
      '-i, --interval <n>',
      'update interval in seconds',
      (i) => Math.max(parseFloat(i), 0.1),
      DEFAULT_OPTION_INTERVAL
    )
    //.option('-d, --dashboard', 'use dashboard layout')
    .option('--demo', 'run program in demo mode')
    .version(version, '-v, --version')
    .arguments('<command> [options...] *')
    .action((command, parsedArgs, {rawArgs}) => {
      const args = addRestParamsToArgs(command, parsedArgs, rawArgs);
      parsedUserCommand = {
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
      console.log('    $ utop -- node --inspect server.js');
      console.log('    $ utop -i 5 -- tail -f /var/log/syslog');
      console.log('');
    });

  commander.parse(process.argv);

  if (!parsedUserCommand.command && !commander.demo) {
    commander.help();
  }

  callback({
    parsedUserCommand,
    options: {
      interval: commander.interval * 1000,
      dashboard: commander.dashboard,
      demo: commander.demo
    }
  });
}

module.exports = parseCliArgs;
