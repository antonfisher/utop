'use strict';

const EventEmitter = require('events');

const blessed = require('blessed');
const blessedContrib = require('blessed-contrib');

class UI extends EventEmitter {
  constructor({command, version}) {
    super();

    this.props = {command, version};

    this._init();
    this._render();
  }

  _init() {
    this.screen = blessed.screen({smartCSR: true});
    this.screen.title = `utop: ${this.props.command}`;
    this.screen.key(['escape', 'q', 'C-c'], () => this.emit('exit'));
  }

  _renderTitle() {
    blessed.text({
      parent: this.screen,
      left: 0,
      top: 0,
      tags: true,
      content: `UTop: {bold}${this.props.command}{/bold}{|}ver.${this.props.version}`
    });
  }

  _renderSectionLine({label, ...rest}) {
    blessed.line({
      parent: this.screen,
      height: 1,
      top: 0,
      left: 0,
      label: ` ${label} `,
      orientation: 'horizontal',
      border: {
        type: 'line'
      },
      style: {
        fg: '#009900'
      },
      ...rest
    });
  }

  _renderLogBox() {
    //ui - log panel
    this._uiLogPanel = blessed.log({
      parent: this.screen,
      top: 9,
      bottom: 0,
      left: 0,
      keys: true,
      mouse: true,
      scrollable: true,
      scrollbar: true,
      //border: {
      //  type: 'line'
      //},
      //label: ' Process Log ',
      style: {
        //border: {
        //  fg: '#009900',
        //},
        scrollbar: {
          bg: '#009900'
        }
      }
    });

    let maxScroll = 0;
    this._uiLogPanel.on('scroll', () => {
      maxScroll = Math.max(maxScroll, this._uiLogPanel.getScroll());
    });
    this._uiLogPanel.on('wheeldown', () => {
      if (this._uiLogPanel.getScroll() === maxScroll) {
        this.emit('scrolledDown');
      }
    });
    this._uiLogPanel.on('wheelup', () => {
      if (this._uiLogPanel.getScroll() !== maxScroll) {
        this.emit('scrolledUp');
      }
    });
  }

  _render() {
    this._renderTitle();

    this._renderSectionLine({
      top: 2,
      label: 'Process CPU'
    });

    this._renderSectionLine({
      top: 5,
      label: 'Process Memory'
    });

    this._renderSectionLine({
      top: 8,
      label: 'Process Log'
    });

    this._renderLogBox();

    this.screen.render();
  }

  addLog(log) {
    this._uiLogPanel.log(log);
  }

  destroy() {
    this.screen.destroy();
  }
}

module.exports = UI;
