'use strict';

const EOL = require('os').EOL;

const blessed = require('blessed');
const sparkline = require('sparkline');

class SparklineChart {
  constructor({
    title,
    height = 1,
    maxValue = 0,
    valuePadding = 6,
    colorOk = 'yellow',
    colorWarn = 'red',
    screen,
    ...props
  }) {
    this.title = title;
    this.height = Math.max(Number(height) || 1, 1);
    this.maxValue = maxValue;
    this.valuePadding = valuePadding;
    this.colorOk = colorOk;
    this.colorWarn = colorWarn;
    this.screen = screen;
    this.props = props;

    this._dataArray = [];

    this._init();
    this._render();

    this.screen.on('resize', () => {
      this._init();
      this._render();
    });
  }

  _init() {
    const countLimit = Math.max(this.screen.width - this.title.length - this.valuePadding - 1, 1);

    let oldDataArray = this._dataArray;
    if (oldDataArray.length > countLimit) {
      oldDataArray = this._dataArray.slice(-countLimit);
    }

    this._dataArray = new Array(countLimit - oldDataArray.length).fill(0).concat(oldDataArray);
  }

  _renderChart() {
    const lines = [];

    // first one is allways 100% for the right 0-maxValue scale
    const data = [this.maxValue].concat(this._dataArray.slice(1));
    const max = Math.max(...data);
    const linesData = [];
    const rowDataHeight = max / this.height;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      for (let j = 0; j < this.height; j++) {
        let rowValue = 0;
        linesData[j] = linesData[j] || [];

        if (rowDataHeight !== 0) {
          if (value >= (j + 1) * rowDataHeight) {
            rowValue = 100;
          } else if (value <= j * rowDataHeight) {
            rowValue = 0;
          } else {
            rowValue = 100 * (value - j * rowDataHeight) / rowDataHeight;
          }
        }

        linesData[j].push(rowValue);
      }
    }

    for (let i = this.height - 1; i >= 0; i--) {
      const graphString = sparkline(linesData[i])
        .split('')
        .map((s, j) => {
          if (j === 0) {
            // do transparent first one fake value
            return `{${this.colorOk}-fg}▕{/${this.colorOk}-fg}`;
          } else if (i > 0 && linesData[i][j] === 0) {
            return ' ';
          } else if (this.maxValue && this._dataArray[j] > this.maxValue * 0.66) {
            return `{${this.colorWarn}-fg}${s}{/${this.colorWarn}-fg}`;
          } else {
            return `{${this.colorOk}-fg}${s}{/${this.colorOk}-fg}`;
          }
        })
        .join('');
      lines.push(graphString);
    }

    return lines;
  }

  _render(printValue = '', postfix = '') {
    const chartStrings = this._renderChart();
    const emptyPrefix = `${String(' ').repeat(this.title.length)}`;

    let content = [];
    for (let i = 0; i < chartStrings.length; i++) {
      if (i === 0) {
        content.push(`${this.title}${chartStrings[i]} {bold}${printValue}{/bold}${postfix}`);
      } else {
        content.push(`${emptyPrefix}${chartStrings[i]}`);
      }
    }
    content = content.join(EOL);

    if (this._chart) {
      this._chart.setContent(content);
      this.screen.render();
    } else {
      this._chart = blessed.text({
        parent: this.screen,
        tags: true,
        content,
        ...this.props
      });
    }
  }

  add(rawValue, printValue = '', postfix = '') {
    let validatedValue = Math.ceil(rawValue);
    if (this.maxValue) {
      validatedValue = Math.min(validatedValue, this.maxValue);
    }

    this._dataArray.push(validatedValue);
    this._dataArray.shift();
    this._render(printValue, postfix);
  }
}

module.exports = SparklineChart;
