# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.3.0"></a>
# [1.3.0](https://github.com/antonfisher/utop/compare/v1.2.0...v1.3.0) (2018-02-08)


### Bug Fixes

* add -h option to docs ([fc40e47](https://github.com/antonfisher/utop/commit/fc40e47))
* start collecting stats w/o interval delay ([cec5e91](https://github.com/antonfisher/utop/commit/cec5e91))


### Features

* adjustable chart height ([f2cce35](https://github.com/antonfisher/utop/commit/f2cce35))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/antonfisher/utop/compare/v1.1.0...v1.2.0) (2018-02-06)


### Features

* support nodejs >=6 ([fb4b92c](https://github.com/antonfisher/utop/commit/fb4b92c))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/antonfisher/utop/compare/v1.0.1...v1.1.0) (2018-02-04)


### Bug Fixes

* disable dashboard feature for first release ([b4d9651](https://github.com/antonfisher/utop/commit/b4d9651))
* error while exiting after child process exit ([aaa65c7](https://github.com/antonfisher/utop/commit/aaa65c7))
* show normal exit message if subprocess exits with code 0 ([4b690fc](https://github.com/antonfisher/utop/commit/4b690fc))
* stop collecting stats after subprocess exits ([caa0499](https://github.com/antonfisher/utop/commit/caa0499))
* stop timer after subprocess exiting ([809d662](https://github.com/antonfisher/utop/commit/809d662))


### Features

* auto format byte values ([6a70d3f](https://github.com/antonfisher/utop/commit/6a70d3f))
* first version of docs + demo animation ([0daa3a3](https://github.com/antonfisher/utop/commit/0daa3a3))
* resizable cpu/mem charts ([484f981](https://github.com/antonfisher/utop/commit/484f981))
* substr long commands in the title ([f6d5624](https://github.com/antonfisher/utop/commit/f6d5624))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/antonfisher/utop/compare/v1.0.0...v1.0.1) (2018-01-31)


### Features

* add pid and uptime timer to header line ([93135ac](https://github.com/antonfisher/utop/commit/93135ac))



<a name="1.0.0"></a>
# 1.0.0 (2018-01-31)


### Bug Fixes

* command in title lost a space ([50ec8ce](https://github.com/antonfisher/utop/commit/50ec8ce))
* make it runable ([d1214a9](https://github.com/antonfisher/utop/commit/d1214a9))
* mem chart to don't use max value ([cef7959](https://github.com/antonfisher/utop/commit/cef7959))


### Features

* add demo option ([67f0223](https://github.com/antonfisher/utop/commit/67f0223))
* add sparkline charts, compact mode, error handling ([8706ceb](https://github.com/antonfisher/utop/commit/8706ceb))
* add terminal ui, show child process log ([b8e61ab](https://github.com/antonfisher/utop/commit/b8e61ab))
* move stats collector to separated class, fixed stats collection ([6947edd](https://github.com/antonfisher/utop/commit/6947edd))
* parse user command, show help, version, add eslint and prettier ([6fadaed](https://github.com/antonfisher/utop/commit/6fadaed))
* right way to kill subrocesses, fix cpu calculation ([87689d5](https://github.com/antonfisher/utop/commit/87689d5))
* show process real cpu and memory usage ([dbaf8e2](https://github.com/antonfisher/utop/commit/dbaf8e2))
* use separated modules for cli, ui, and subprocess management ([fbb3b22](https://github.com/antonfisher/utop/commit/fbb3b22))
