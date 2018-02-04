'use strict';

const blessed = require('blessed');

const LABEL_APP = 'UTop ver.';
const LABEL_PID = 'PID: ';

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
    let title = blessed.escape(this.command);
    const limit =
      this.screen.width -
      LABEL_PID.length -
      String(this.pid).length -
      String(this.time).length -
      LABEL_APP.length -
      String(this.version).length -
      9;

    if (title.length > limit) {
      title = `${title.substr(0, limit - 3)}...`;
    }

    const content = [
      `{bold}${title}{/bold}`,
      '{|}',
      `[${LABEL_PID}{bold}${this.pid}{/bold}] `,
      `[{bold}${this.time}{/bold}] `,
      `${LABEL_APP}${this.version}`
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
