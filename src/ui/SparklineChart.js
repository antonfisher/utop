'use strict';

const blessed = require('blessed');
const sparkline = require('sparkline');

class SparklineChart {
  constructor({
    title,
    maxValue = 100,
    valuePadding = 7,
    postfix = '',
    colorOk = 'yellow',
    colorWarn = 'red',
    screen,
    ...props
  }) {
    this.title = title;
    this.maxValue = maxValue;
    this.valuePadding = valuePadding;
    this.postfix = postfix;
    this.colorOk = colorOk;
    this.colorWarn = colorWarn;
    this.screen = screen;
    this.props = props;

    this._init();
    this._render();
  }

  _init() {
    const countLimit = this.screen.width - this.title.length - this.valuePadding;

    this._dataArray = new Array(countLimit).fill(0);

    // first one is allways 100% for the right 0-100% scale
    this._dataArray[0] = this.maxValue;
  }

  _render(value = 0) {
    const graphString = sparkline(this._dataArray)
      .split('')
      .map((s, i) => {
        if (i === 0) {
          return ''; // do transparent first one fake value
        } else if (this._dataArray[i] > 50) {
          return `{${this.colorWarn}-fg}${s}{/${this.colorWarn}-fg}`;
        } else {
          return `{${this.colorOk}-fg}${s}{/${this.colorOk}-fg}`;
        }
      })
      .join('');

    const content = `${this.title} ${graphString} {bold}${value}{/bold}${this.postfix}`;

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

  add(value) {
    const validatedValue = Math.min(Math.ceil(value), this.maxValue);
    this._dataArray.push(validatedValue);
    this._dataArray.shift();
    this._dataArray[0] = this.maxValue;
    this._render(validatedValue);
  }
}

module.exports = SparklineChart;
