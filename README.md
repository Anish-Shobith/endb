# Endb

<p>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/v/endb.svg" alt="npm-version" /></a>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/dt/endb.svg" alt="npm-downloads" /></a>
  <a href="https://david-dm.org/chroventer/endb"><img src="https://img.shields.io/david/chroventer/endb.svg" alt="dependencies" /></a>
  <a href="https://github.com/chroventer/endb/stargazers"><img src="https://img.shields.io/github/stars/chroventer/endb.svg?style=social&label=Star"></a>
</p>

## About

A simplified & powerful key-value database wrapper for ease-of-use

There are a few existing modules similar to endb, however, endb is different because it:

- Has a simple Promise-based API
- Is easily embeddable inside another module
- Can handle all SQLite types
- Is persistent, highly configurable, and user-friendly
- Supports the current active LTS version of Node.js or higher

## Installation

> Node.js 10.0 or newer is required.
> If installation-error persists, check out the [troubleshooting guide](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md)

### Windows

- Open an administrative command prompt or powershell
- Run: `npm i -g --add-python-to-path --vs2015 --production windows-build-tools`
- Restart all open command prompts, powershell windows, and editors with a built-in console/prompt
- Run `npm i better-sqlite3` in the console

### Mac

- Install [XCode](https://developer.apple.com/xcode)
- Once XCode is installed, go to Preferences, Downloads, and install the Command Line Tools.
- Run `npm i better-sqlite3` in the console

### Linux

- Install C++ build tools by running `sudo apt-get install build-essential`
- Run `npm i better-sqlite3` in console

## Usage

```js
// Some of the methods are not mentioned, refer to the documentation: endb.js.org
const Endb = require('endb');
const db = new Endb.Database();

db.set('account:foo', 'bar'); // -> { key: 'account_1234567890', value: 'bar' }
db.set('account:foobar', {
  id: 1234567890,
  password: 'bar',
  verified: false,
  checked: true
}); // -> { key: 'account:foo', value: '{"id":1234567890,"password":"bar","verified":false,"checked":true}' }
db.get('account:foo'); // -> password
db.has('account:foobar'); // -> true
db.delete('account:foo'); // -> true
db.getAll() // -> // -> [ { key: 'account:foobar', value: '{"id":1234567890,"password":"password",verfied:false,"checked":true}' } ]
db.clear(); // -> undefined
db.destroy(); // -> undefined
```

## Links

- [Documentation](https://endb.js.org)
- [GitHub](https://github.com/chroventer/endb)
- [NPM](https://npmjs.com/endb)
