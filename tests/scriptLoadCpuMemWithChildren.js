'use strict';

const os = require('os');
const {resolve} = require('path');
const {spawn} = require('child_process');

const scriptPath = resolve(__dirname, './scriptLoadCpuMem.js');

const childProcesses = [];

function run(title) {
  console.log(`Run child process: ${title} ${scriptPath}`);

  const childProcess = spawn('node', [scriptPath]);

  console.log(`Child process ${title} pid: ${childProcess.pid}`);

  childProcess.stdout.on('data', (data) => process.stdout.write(`Process ${title}: ${data.toString()}`));
  childProcess.stderr.on('data', (data) => process.stdout.write(`Process ${title}: ${data.toString()}`));
  childProcess.on('error', ({message}) => console.log(`Process ${title} ERROR: ${message}`));
  childProcess.on('close', (code) => console.log(`Process ${title} exited: ${code}`));

  childProcesses.push(childProcess);
}

console.log(`Parent process pid: ${process.pid}`);

const cpuCount = os.cpus().length;

for (let i = 0; i < cpuCount - 1 || i === 0; i++) {
  run(i + 1);
}
