'use strict';

const NA = 'N/A';
const TITLES = ['B', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];

function formatBytes(rawValue, width = 6) {
  let value = rawValue || 0;
  let postfix = TITLES[0];

  if (value > 0) {
    const index = Math.floor(Math.log2(value || 0) / 10);
    if (TITLES[index]) {
      value = value / Math.pow(2, index * 10);
      if (value.toFixed(1).length <= width - TITLES[index].length) {
        value = value.toFixed(1);
      } else {
        value = value.toFixed(0);
      }
      postfix = TITLES[index];
    } else {
      value = NA;
      postfix = '';
    }
  } else {
    value = value.toString();
  }

  return [value, postfix];
}

module.exports = formatBytes;
