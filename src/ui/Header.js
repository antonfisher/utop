'use strict';

const blessed = require('blessed');

class Header {
  constructor({screen, command, version, pid = '-', time = '--:--:--', ...props}) {
    this.screen = screen;
    this.command = command;
    this.version = version;
    this.pid = pid;
    this.time = time;
    this.props = props;

    this._render();
  }

  _render() {
    const content = [
      `{bold}${blessed.escape(this.command)}{/bold} `,
      `[PID: {bold}${this.pid}{/bold}]`,
      `[uptime: {bold}${this.time}{/bold}]`,
      '{|}',
      `UTop ver.${this.version}`
    ].join('');

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

  update({pid, time}) {
    this.pid = pid || this.pid;
    this.time = time || this.time;
    this._render();
  }
}

module.exports = Header;
