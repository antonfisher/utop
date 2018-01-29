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
  constructor({command, compact, version}) {
    super();

    this.props = {command, compact, version};

    this._init();
    this._render();
  }

  _init() {
    this.screen = blessed.screen({smartCSR: true});
    this.screen.title = `utop: ${this.props.command}`;
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

    let maxScroll = 0;
    logBox.on('scroll', () => {
      maxScroll = Math.max(maxScroll, logBox.getScroll());
    });
    logBox.on('wheeldown', () => {
      if (logBox.getScroll() === maxScroll) {
        this.emit('scrolledDown');
      }
    });
    logBox.on('wheelup', () => {
      if (logBox.getScroll() !== maxScroll) {
        this.emit('scrolledUp');
      }
    });

    return logBox;
  }

  _render() {
    const chartHeight = Math.ceil(this.screen.height / 4);
    const calculateTop = createTopCalculator();

    this._renderTitle({top: calculateTop(2)});

    if (this.props.compact) {
      this._uiCpuChart = this._renderSparkline({
        top: calculateTop(2),
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
    } else {
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
    }

    if (!this.props.compact) {
      this._renderSectionLine({
        top: calculateTop(1),
        label: 'Log'
      });
    }

    this._uiLogBox = this._renderLogBox({
      top: calculateTop()
    });

    this.screen.render();
  }

  addCpu(value) {
    this._uiCpuChart.add(value);
  }

  addMem(value) {
    this._uiMemChart.add(value);
  }

  addLog(log, {error = false} = {}) {
    let formattedLog = log;
    if (error) {
      formattedLog = `{red-fg}${log}{/red-fg}`;
    }
    this._uiLogBox.log(formattedLog);
  }

  destroy() {
    this.screen.destroy();
  }
}

module.exports = UI;
