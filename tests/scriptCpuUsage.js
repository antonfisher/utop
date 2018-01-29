'use strict';

const INTERVAL = 2000;
const START_POWER = 15;

let power = START_POWER;
let changeDirection = 1;

const calculate = () => {
  const message = `Calculate random x 2**${power} times`;
  const startDate = +new Date();
  console.log(`${message} ...`);
  let value = 1;
  for (let i = 0; i < 2 ** power; i++) {
    value *= Math.random();
  }
  const ms = +new Date() - startDate;
  console.log(`${new Array(message.length).fill(' ').join('')} takes: ${ms}ms`);
  if (ms > INTERVAL * 1.5 || power < START_POWER) {
    changeDirection = -changeDirection;
  }
  power += changeDirection;
  setTimeout(calculate, INTERVAL);
};

calculate();
