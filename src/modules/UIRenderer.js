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
  constructor({command, dashboard, version}) {
    super();

    this.props = {command, dashboard, version};

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

  _renderSectionLine({label, ...props}) {
    return blessed.line({
      parent: this.screen,
      height: 1,
      label: ` ${label} `,
      orientation: 'horizontal',
      border: {
        type: 'line'
      },
      style: {
        fg: 'yellow'
      },
      ...props
    });
  }

  _renderChart(props) {
    const chart = blessed.box({
      parent: this.screen,
      ...props
    });

    chart.add = () => {};

    return chart;
  }

  _renderSparkline(props) {
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
    const chartHeight = Math.ceil(this.screen.height / 4);
    const calculateTop = createTopCalculator();

    this._uiHeader = this._renderTitle({top: calculateTop(2)});

    if (this.props.dashboard) {
      this._renderSectionLine({
        top: calculateTop(1),
        label: 'CPU'
      });

      this._uiCpuChart = this._renderChart({
        top: calculateTop(chartHeight),
        height: chartHeight
      });

      this._renderSectionLine({
        top: calculateTop(1),
        label: 'Memory'
      });

      this._uiMemChart = this._renderChart({
        top: calculateTop(chartHeight),
        height: chartHeight
      });

      this._renderSectionLine({
        top: calculateTop(1),
        label: 'Log'
      });
    } else {
      this._uiCpuChart = this._renderSparkline({
        top: calculateTop(2),
        maxValue: 100,
        title: 'CPU:'
      });

      this._uiMemChart = this._renderSparkline({
        top: calculateTop(2),
        title: 'Mem:',
        colorOk: 'cyan',
        colorWarn: 'blue'
      });
    }

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
