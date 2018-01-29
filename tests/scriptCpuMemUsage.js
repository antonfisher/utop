'use strict';

const INTERVAL = 2000;
const START_POWER = 16;

let power = START_POWER;
let changeDirection = 1;

const calculate = () => {
  const message = `Calculate random + allocating array size: 2**${power}`;
  const startDate = +new Date();
  console.log(`${message} ...`);
  let value = 1;
  for (let i = 0; i < 2 ** power; i++) {
    value *= Math.random();
  }
  new Array(2 ** power).fill(' ');
  const ms = +new Date() - startDate;
  console.log(`${message} takes: ${ms}ms`);
  if (ms > INTERVAL * 1.5 || power < START_POWER) {
    changeDirection = -changeDirection;
  }
  power += changeDirection;
  setTimeout(calculate, INTERVAL);
};

calculate();
