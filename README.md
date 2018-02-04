# utop

CLI tool for single process monitoring written on Node.js

[![Build Status](https://travis-ci.org/antonfisher/utop.svg?branch=master)](https://travis-ci.org/antonfisher/utop)
[![bitHound](https://www.bithound.io/github/antonfisher/utop/badges/dependencies.svg)](https://www.bithound.io/github/antonfisher/utop/master/dependencies/npm)
[![npm](https://img.shields.io/npm/v/utop.svg?colorB=brightgreen)](https://www.npmjs.com/package/utop)
![status](https://img.shields.io/badge/status-beta-lightgray.svg)

![Main view](https://raw.githubusercontent.com/antonfisher/utop/docs/images/demo.v1.gif)

## Try w/o installation
```bash
#run demo
npx utop --demo

#run any program
npx utop node server.js

#run any program with options
npx utop -- tail -f /var/log/syslog
```

## Install globally
```bash
sudo npm install -g utop
```

## Usage
```bash
$ utop

  Usage: utop [options] <command>

  Options:

    -i, --interval <n>  update interval in seconds (default: 0.5)
    --demo              run program in demo mode
    -v, --version       output the version number
    -h, --help          output usage information
```

## Requirements
Node.js v8.9.1 or higher.

## Development version
```bash
git clone https://github.com/antonfisher/utop.git
npm run format
npm run demo
npm run test:cpu
```

## License
MIT License. Free use and change.
