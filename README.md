Endb
=========

[![version](https://badgen.net/npm/v/endb)](https://www.npmjs.com/package/endb)
[![downloads](https://badgen.net/npm/dt/endb)](https://www.npmjs.com/package/endb)
[![dependencies](https://img.shields.io/david/endb/endb.svg)](https://david-dm.org/endb/endb)
[![stars](https://badgen.net/github/stars/endb/endb)](https://github.com/endb/endb)
[![node](https://badgen.net/npm/node/endb)](https://www.npmjs.com/package/endb)
[![license](https://badgen.net/github/license/endb/endb)](https://github.com/endb/endb/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/endb)

Endb is an easy-to-use Node.js ORM for SQLite3. It follows [SemVer](http://semver.org/) and supports Node v8.9.4 or later.
New to Endb? Check out the [API Reference](https://endb.js.org)
- Full transaction support
- High performance, efficiency, and safety
- Scalable
- Easy-to-use synchronous API (faster than an asynchronous API)

## Installation
```
npm install --save endb
```
> If you have trouble installing, check the [troubleshooting guide](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md)

## Usage
```js
// ./models/User.js:
const endb = require('endb');
module.exports = endb.model('User', {
  id: endb.NUMBER,
  username: endb.STRING,
  verified: endb.BOOLEAN,
  null: endb.NULL
});
```

```js
// ./index.js:
const User = require('./models/User');

User.insert({
  id: 123456789,
  username: 'testuser',
  verified: true,
  null: null
});
User.find({ id: 123456789, username: 'testuser' });
User.update({ id: 123456789 }, { verified: false });
User.has({ id: 123456789 });
User.delete({ username: 'testuser' });
User.close();
```

## Links
- [Documentation](https://endb.js.org)
- [Discord](https://discord.gg/A9qvE3g)
- [GitHub](https://github.com/endb/endb)
- [NPM](https://npmjs.com/endb)
- [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3)
- [What is ORM?](https://wikipedia.org/wiki/Object-relational_mapping)