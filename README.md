# Endb

<p>
  <a href="https://discord.gg/A9qvE3g"><img src="https://discordapp.com/api/guilds/608366465376059429/embed.png" alt="discord-server" /></a>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/v/endb.svg" alt="npm-version" /></a>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/dt/endb.svg" alt="npm-downloads" /></a>
  <a href="https://david-dm.org/endb/endb"><img src="https://img.shields.io/david/endb/endb.svg" alt="npm-dependencies" /></a>
  <a href="https://github.com/endb/endb/stargazers"><img src="https://img.shields.io/github/stars/endb/endb.svg?style=social&label=Star"></a>
  <a href="https://www.patreon.com/endb"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="patreon" /></a>
</p>

## About
Endb is a easy-to-use SQLite3 ORM (Object-Relational Mapping) for Node.js
New to Endb? Check out the [API Reference](https://endb.js.org)

- Full transaction support
- High performance, efficiency, and safety
- Scalable
- Easy-to-use synchronous API (faster than an asynchronous API)

## Installation
```
npm i endb
```
> If you have trouble installing, check the [troubleshooting guide](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md)

## Usage
```js
// ./models/User.js:
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
// ./index.js:
const User = require('./models/User');

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
- [Discord](https://discord.gg/A9qvE3g)
- [GitHub](https://github.com/endb/endb)
- [NPM](https://npmjs.com/endb)
- [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3)
- [What is ORM?](https://wikipedia.org/wiki/Object-relational_mapping)