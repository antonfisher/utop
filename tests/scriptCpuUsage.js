'use strict';

const INTERVAL = 1000;

let power = 15;
const calculate = () => {
  const startDate = +new Date();
  let value = 1;
  for (let i = 0; i < 2 ** power; i++) {
    value *= Math.random();
  }
  const ms = +new Date() - startDate;
  console.log(`Calculate random x ${2 ** power} times takes: ${ms}ms`);
  if (ms < INTERVAL) {
    power += 1;
  }
  setTimeout(calculate, INTERVAL);
};

calculate();
