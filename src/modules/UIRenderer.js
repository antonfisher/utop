'use strict';

const EventEmitter = require('events');

const blessed = require('blessed');

const formatBytes = require('../helpers/formatBytes');
const Header = require('../ui/Header');
const SparklineChart = require('../ui/SparklineChart');

const SPARKLINE_VALUE_PADDING = 6;

function createTopCalculator() {
  let top = 0;
  return (height = 0) => {
    const prevTop = top;
    top += height;
    return prevTop;
  };
}

class UIRenderer extends EventEmitter {
  constructor({command, chartHeight, version}) {
    super();

    this.props = {command, chartHeight, version};

    this._init();
  }

  _init() {
    this.screen = blessed.screen({smartCSR: true});
    this.screen.key(['escape', 'q', 'C-c'], () => this.emit('exit'));
  }

  _renderTitle(props) {
    return new Header({
      screen: this.screen,
      command: this.props.command,
      version: this.props.version,
      ...props
    });
  }

  _renderChart(props) {
    return new SparklineChart({screen: this.screen, valuePadding: SPARKLINE_VALUE_PADDING, ...props});
  }

  _renderLogBox(props) {
    const logBox = blessed.log({
      parent: this.screen,
      bottom: 0,
      keys: true,
      mouse: true,
      vi: true,
      tags: true,
      focused: true,
      scrollable: true,
      scrollbar: true,
      style: {
        scrollbar: {
          bg: 'yellow'
        }
      },
      ...props
    });

    let doBufferOutput = false;

    let maxScroll = 0;
    logBox.on('scroll', () => {
      maxScroll = Math.max(maxScroll, logBox.getScroll());
    });
    logBox.on('wheelup', () => {
      if (logBox.getScroll() !== maxScroll) {
        doBufferOutput = true;
      }
    });
    logBox.on('wheeldown', () => {
      if (logBox.getScroll() === maxScroll) {
        doBufferOutput = false;
      }
    });

    let bufferedOutput = [];
    logBox.log = (str) => {
      if (doBufferOutput) {
        bufferedOutput.push(str);
      } else {
        if (bufferedOutput.length > 0) {
          bufferedOutput.forEach((bufferedStr) => {
            logBox.add(bufferedStr.replace(/\n$/, ''));
          });
          bufferedOutput = [];
        }
        logBox.add(str.replace(/\n$/, ''));
      }
    };

    return logBox;
  }

  render() {
    const calculateTop = createTopCalculator();

    this._uiHeader = this._renderTitle({top: calculateTop(2)});

    this._uiCpuChart = this._renderChart({
      top: calculateTop(this.props.chartHeight + 1),
      height: this.props.chartHeight,
      maxValue: 100,
      title: 'CPU:'
    });

    this._uiMemChart = this._renderChart({
      top: calculateTop(this.props.chartHeight + 1),
      height: this.props.chartHeight,
      title: 'Mem:',
      colorOk: 'cyan'
    });

    this._uiLogBox = this._renderLogBox({
      top: calculateTop()
    });

    this.screen.render();

    //TODO to separate class
    this._startTime = Math.round(+new Date() / 1000);
    this._updateTimerInterval = setInterval(() => {
      const diff = Math.round(+new Date() / 1000) - this._startTime;
      const seconds = diff % 60;
      const minutes = ((diff - seconds) / 60) % 60;
      const hours = Math.floor(diff / 60 / 60);
      this._uiHeader.update({
        time: [hours, minutes, seconds].map((i) => i.toString().padStart(2, '0')).join(':')
      });
    }, 1000);

    return this;
  }

  setPid(pid) {
    this._uiHeader.update({pid});
    return this;
  }

  addCpu(value) {
    this._uiCpuChart.add(
      value,
      Math.round(value)
        .toString()
        .padStart(SPARKLINE_VALUE_PADDING - 1, ' '),
      '%'
    );
    return this;
  }

  addMem(value) {
    const [textValue, postfix] = formatBytes(value, SPARKLINE_VALUE_PADDING);
    this._uiMemChart.add(value, textValue.padStart(SPARKLINE_VALUE_PADDING - postfix.length, ' '), postfix);
    return this;
  }

  addLog(log) {
    this._uiLogBox.log(log);
    return this;
  }

  addError(err) {
    this._uiLogBox.log('');
    this._uiLogBox.log(`{red-fg}${err}{/red-fg}`);
    return this;
  }

  stopTimer() {
    clearInterval(this._updateTimerInterval);
  }

  destroy() {
    clearInterval(this._updateTimerInterval);
    this.screen.destroy();
  }
}

module.exports = UIRenderer;
