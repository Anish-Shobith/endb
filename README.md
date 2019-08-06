# Endb

<p>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/v/endb.svg" alt="npm-version" /></a>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/dt/endb.svg" alt="npm-downloads" /></a>
  <a href="https://david-dm.org/endb/endb"><img src="https://img.shields.io/david/endb/endb.svg" alt="dependencies" /></a>
  <a href="https://github.com/endb/endb/stargazers"><img src="https://img.shields.io/github/stars/endb/endb.svg?style=social&label=Star"></a>
</p>

## About
Endb is a easy-to-use SQLite3 ORM (Object-Relational Mapping) for Node.js
New to Endb? Check out the [API Reference](https://endb.js.org)

- Full transaction support
- High performance, efficiency, and safety
- Easy-to-use synchronous API (faster than an asynchronous API)

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
- Once XCode is installed, go to Preferences, Downloads, and install the Command Line Tools
- Run `npm i better-sqlite3` in the console

### Linux
- Install C++ build tools by running `sudo apt-get install build-essential`
- Run `npm i better-sqlite3` in console

## Usage
```js
// /models/User.js:
const endb = require('endb');
module.exports = endb.model('User', {
  id: endb.Types.NUMBER,
  username: endb.Types.STRING,
  description: endb.Types.TEXT,
  created: endb.Types.DATE,
  done: endb.Types.NULL
});
```

```js
// /index.js:
const User = require('/models/User');

User.insert({
  id: 123456789,
  username: 'testuser',
  description: 'a test user',
  created: Date.now(),
  done: null
});

User.find({ id: 123456789, description: 'a test user' });

User.update({ id: 123456789 }, { description: 'test user' });

User.delete({ username: 'testuser' });

User.close();
```

## Links

- [Documentation](https://endb.js.org)
- [GitHub](https://github.com/endb/endb)
- [NPM](https://npmjs.com/endb)
- [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3)
- [What is ORM?](https://wikipedia.org/wiki/Object-relational_mapping)