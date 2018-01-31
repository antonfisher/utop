'use strict';

const blessed = require('blessed');
const sparkline = require('sparkline');

class SparklineChart {
  constructor({
    title,
    maxValue = 0,
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
    const countLimit = Math.max(this.screen.width - this.title.length - this.valuePadding, 1);

    this._dataArray = new Array(countLimit).fill(0);

    // first one is allways 100% for the right 0-maxValue scale
    this._dataArray[0] = this.maxValue;
  }

  _render(value = 0) {
    const graphString = sparkline(this._dataArray)
      .split('')
      .map((s, i) => {
        if (i === 0) {
          return ''; // do transparent first one fake value
        } else if (this.maxValue && this._dataArray[i] > this.maxValue * 0.66) {
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
    let validatedValue = Math.ceil(value);
    if (this.maxValue) {
      validatedValue = Math.min(validatedValue, this.maxValue);
    }

    this._dataArray.push(validatedValue);
    this._dataArray.shift();
    this._dataArray[0] = this.maxValue;
    this._render(validatedValue);
  }
}

module.exports = SparklineChart;
