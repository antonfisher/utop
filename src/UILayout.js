'use strict';

const EventEmitter = require('events');
const blessed = require('blessed');
const SparklineChart = require('./ui/SparklineChart');

function createTopCalculator() {
  let top = 0;
  return (height = 0) => {
    const prevTop = top;
    top += height;
    return prevTop;
  };
}

class UI extends EventEmitter {
  constructor({command, dashboard, version}) {
    super();

    this.props = {command, dashboard, version};

    this._init();
  }

  _init() {
    this.screen = blessed.screen({smartCSR: true});
    //this.screen.title = `UTop: ${this.props.command}`;
    this.screen.key(['escape', 'q', 'C-c'], () => this.emit('exit'));
  }

  _renderTitle(props) {
    return blessed.text({
      parent: this.screen,
      tags: true,
      content: `{bold}${this.props.command}{/bold}{|}UTop ver.${this.props.version}`,
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
    return new SparklineChart({screen: this.screen, ...props});
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

    this._renderTitle({top: calculateTop(2)});

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
        title: 'CPU:',
        postfix: '%'
      });

      this._uiMemChart = this._renderSparkline({
        top: calculateTop(2),
        title: 'Mem:',
        postfix: 'Mb', //TODO replace
        colorOk: 'cyan',
        colorWarn: 'blue'
      });
    }

    this._uiLogBox = this._renderLogBox({
      top: calculateTop()
    });

    this.screen.render();

    return this;
  }

  addCpu(value) {
    this._uiCpuChart.add(value);
    return this;
  }

  addMem(value) {
    this._uiMemChart.add(value);
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

  destroy() {
    this.screen.destroy();
  }
}

module.exports = UI;
