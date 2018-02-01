'use strict';

const EventEmitter = require('events');
const {spawn} = require('child_process');

const terminate = require('terminate');

class UserProcess extends EventEmitter {
  constructor({command, args, fullCommand}) {
    super();

    this.props = {command, args, fullCommand};
  }

  kill(callback) {
    if (this.process) {
      terminate(this.process.pid, (err) => callback(!err || err.code === 'ESRCH' ? null : err));
    } else {
      callback();
    }
  }

  run() {
    let str = '';

    this.process = spawn(this.props.command, this.props.args);

    this.process.stdout.on('data', (data) => {
      str += data.toString();
      if (str.includes('\n')) {
        this.emit('stdout', str.replace(/\n$/, ''));
        str = '';
      }
    });

    this.process.stderr.on('data', (data) => {
      this.emit('stderr', `STDERR: ${data.toString().replace(/\n$/, '')}`); //TODO red color
    });

    this.process.on('close', (code) => {
      this.emit('exit', code);
    });

    this.process.on('error', ({code, message}) => {
      if (code === 'ENOENT') {
        this.emit('error', `Failed to run subprocess, try to run command with out UTop: "${this.props.fullCommand}"`);
      } else {
        this.emit('error', `Failed to run subprocess: (${code}) ${message}`);
      }
    });

    return this;
  }
}

module.exports = UserProcess;
