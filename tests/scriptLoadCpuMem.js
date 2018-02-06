'use strict';

const INTERVAL = 2000;
const START_POWER = 20;

let power = START_POWER;
let changeDirection = 1;

const calculate = () => {
  const message = `Calculate random + allocating array size: 2**${power}`;
  const startDate = +new Date();
  console.log(`${message} ...`);
  let value = 1;
  for (let i = 0; i < Math.pow(2, power); i++) {
    value *= Math.sqrt(Math.random());
  }
  new Array(Math.pow(2, power)).fill(' ');
  const ms = +new Date() - startDate;
  console.log(`${message} takes: ${ms}ms`);
  if (ms > INTERVAL * 5 || power < START_POWER) {
    changeDirection = -changeDirection; // waves
    //changeDirection = 0;   // climb
  }
  power += changeDirection;
  setTimeout(calculate, INTERVAL);
};

calculate();
