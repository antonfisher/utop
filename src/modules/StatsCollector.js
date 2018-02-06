'use strict';

const EventEmitter = require('events');
const os = require('os');

const psTree = require('ps-tree');
const pidUsage = require('pidusage');

const cpuCount = os.cpus().length;

class StatsCollelector extends EventEmitter {
  constructor({pid, interval}) {
    super();

    if (typeof interval === 'undefined' || interval <= 0) {
      throw new Error('[StatsCollelector] interval property has to be greater than 0');
    }

    this.props = {pid, interval};

    this._intervalId = null;
    this._isCollecting = false;
  }

  _sumStats(stats, newStat) {
    stats.cpu += Math.floor(newStat.cpu / cpuCount);
    stats.mem += Math.floor(newStat.memory);
    return stats;
  }

  _onStatsCollected(stats) {
    this._isCollecting = false;
    this.emit('stats', stats);
  }

  _collectPidStats() {
    if (this._isCollecting) {
      return;
    }
    this._isCollecting = true;

    let stats = {cpu: 0, mem: 0};
    psTree(this.props.pid, (err, children) => {
      if (children && children.length > 0) {
        const childrenCount = children.length;
        let childrenChecked = 0;
        children.forEach(({PID}) =>
          pidUsage.stat(PID, (err, stat) => {
            childrenChecked++;
            if (!err) {
              stats = this._sumStats(stats, stat);
            }
            if (childrenChecked === childrenCount) {
              this._onStatsCollected(stats);
            }
          })
        );
      } else {
        pidUsage.stat(this.props.pid, (err, stat) => {
          if (!err) {
            stats = this._sumStats(stats, stat);
          }
          this._onStatsCollected(stats);
        });
      }
    });
  }

  run() {
    this._intervalId = setInterval(() => this._collectPidStats(), this.props.interval);
    return this;
  }

  demo() {
    this._intervalId = setInterval(() => {
      this.emit('stats', {
        cpu: (Math.sin(+new Date() / 1000) + 1) / 2 * 100,
        mem: Math.random() * 2 * 1024 * 1024 * 1024
      });
    }, this.props.interval);
    return this;
  }

  destroy() {
    clearInterval(this._intervalId);
  }
}

module.exports = StatsCollelector;
