'use strict';

const {resolve} = require('path');
const {spawn} = require('child_process');

const childProcesses = [];

function run(title) {
  console.log(`Run child process: ${title}`, resolve(__dirname, './scriptCpuMemUsage.js'));

  const childProcess = spawn('node', [resolve(__dirname, './scriptCpuMemUsage.js')]);

  console.log(`Child process ${title} pid: ${childProcess.pid}`);

  childProcess.stdout.on('data', (data) => process.stdout.write(`Process ${title}: ${data.toString()}`));
  childProcess.stderr.on('data', (data) => process.stdout.write(`Process ${title}: ${data.toString()}`));
  childProcess.on('error', ({message}) => console.log(`Process ${title} ERROR: ${message}`));
  childProcess.on('close', (code) => console.log(`Process ${title} exited: ${code}`));

  childProcesses.push(childProcess);
}

console.log(`Parent process pid: ${process.pid}`);
run('A');
run('B');
run('C');
run('D');
