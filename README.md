# Endb

[![version](https://badgen.net/npm/v/endb)](https://www.npmjs.com/package/endb)
[![downloads](https://badgen.net/npm/dt/endb)](https://www.npmjs.com/package/endb)
[![dependencies](https://img.shields.io/david/endb/endb.svg)](https://david-dm.org/endb/endb)
[![stars](https://badgen.net/github/stars/endb/endb)](https://github.com/endb/endb)
[![node](https://badgen.net/npm/node/endb)](https://www.npmjs.com/package/endb)
[![license](https://badgen.net/github/license/endb/endb)](https://github.com/endb/endb/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/endb)

Simple key-value database with multi dialect support. It follows [SemVer](http://semver.org/) and supports LTS version of Node.js or higher.
New to Endb? Check out the [API Reference](https://endb.js.org)
- High performance, efficiency, and safety
- Non-bloated
- Simple Promise-based API
- Suitable as a persistent key-value database
- Easily embeddable inside another module
- Handles all JSON types
- Supports the current active LTS version of Node.js or higher

## Installation
```
npm install --save endb
```

By default, data is stored in the memory, you can optionally install a dialect.
```
$ npm install --save redis
$ npm install --save mongojs # MongoDB
$ npm install --save sqlite3
$ npm install --save pg # Postgres
$ npm install --save mysql2
```

## Usage
```js
const Endb = require('endb');
const db = new Endb(); // memory (Map)
const db = new Endb('redis://user:pass@localhost:6379');
const db = new Endb('mongodb://user:pass@localhost:27017/dbname');
const db = new Endb('sqlite://path/to/database.sqlite');
const db = new Endb('postgresql://user:pass@localhost:5432/dbname');
const db = new Endb('mysql://user:pass@localhost:3306/dbname');

//Handles database connection error
db.on('error', err => console.log('Connection Error', err));

await db.set('foo', 'bar'); // true
await db.get('foo'); // 'bar'
await db.delete('foo'); // true
await db.has('foo'); // false
await db.clear(); // undefined
```

### Namespaces
You can set a namespace to avoid key collisions and namespaces allow you to clear only a certain namespace while using the same database.
```js
const users = new Endb('redis://user:pass@localhost:6379', { namespace: 'users' });
const cache = new Endb('redis://user:pass@localhost:6379', { namespace: 'cache' });

await users.set('foo', 'users'); // true
await cache.set('foo', 'cache'); // true
await users.get('foo'); // 'users'
await cache.get('foo'); // 'cache'
await users.clear(); // undefined
await users.get('foo'); // undefined
await cache.get('foo'); // 'cache'
```

## Links
- [Documentation](https://endb.js.org)
- [GitHub](https://github.com/endb/endb)
- [NPM](https://npmjs.com/endb)