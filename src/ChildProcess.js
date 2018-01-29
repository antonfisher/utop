'use strict';

const EventEmitter = require('events');
const {spawn} = require('child_process');

class ChildProcess extends EventEmitter {
  constructor({command, args, fullCommand}) {
    super();

    this.props = {command, args, fullCommand};
    this.doBufferOutput = false;

    this._run();
  }

  enableOutputBuffer() {
    this.doBufferOutput = true;
  }

  disableOutputBuffer() {
    this.doBufferOutput = false;
  }

  kill() {
    this.process.kill();
  }

  _run() {
    let str = '';
    let bufferedOutput = [];

    this.process = spawn(this.props.command, this.props.args);

    this.process.stdout.on('data', (data) => {
      str += data.toString();
      if (str.includes('\n')) {
        if (this.doBufferOutput) {
          bufferedOutput.push(str);
        } else {
          if (bufferedOutput.length > 0) {
            bufferedOutput.forEach((bufferedStr) => {
              this.emit('stdout', bufferedStr.replace(/\n$/, ''));
            });
            bufferedOutput = [];
          }
          this.emit('stdout', str.replace(/\n$/, ''));
        }
        str = '';
      }
    });

    this.process.stderr.on('data', (data) => {
      this.emit('stderr', `STDERR: ${data.toString().replace(/\n$/, '')}`); //TODO red color
    });

    this.process.on('close', (code) => {
      this.emit('exit', `Child process exited with code: ${code}, press Cmd-C to close UTop.`);
    });

    this.process.on('error', ({code, message}) => {
      if (code === 'ENOENT') {
        this.emit('error', `Failed to run subprocess, try to run command with out UTop: "${this.props.fullCommand}"`);
      } else {
        this.emit('error', `Failed to run subprocess: (${code}) ${message}`);
      }
    });
  }
}

module.exports = ChildProcess;
