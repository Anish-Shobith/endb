import { existsSync, mkdirSync } from 'fs';
import { resolve, sep } from 'path';
import SQLite from 'better-sqlite3';
import { EndbError } from './EndbError';
import { Options } from './Options';

/**
 * A simplified & powerful key-value database wrapper for ease-of-use
 */
export default class Endb {
  name?: string;
  fileName?: string;
  path?: string;
  fileMustExist?: boolean;
  timeout?: number;
  wal?: boolean;
  ready!: Function;
  isReady: boolean;
  onReady: Promise<Function>;
  isDestroyed: boolean;
  db: SQLite.Database;

  /**
   * Initializes a new Database instance
   * @param [options] Database options for the instance
   * @param [options.name] The name of the database. Represents the table name in SQLite
   * @param [options.fileName] The name of the database file
   * @param [options.path] The path of the database file
   * @param [options.fileMustExist] Whether or not, the database file must exist
   * @param [options.timeout] The number of milliseconds to wait while executing queries on a locked database, before throwing a SQLITE_BUSY error
   * @param [options.wal] The default method by which SQLite implements atomic commit and rollback is a rollback journal
   * ```typescript
   * const Endb = require('endb');
   * const db = new Endb({
   *   name: 'endb',
   *   fileName: 'endb',
   *   path: './',
   *   fileMustExist: false,
   *   timeout: 5000,
   *   wal: true
   * });
   * ```
   */
  constructor(options: Options = {}) {
    this.name = typeof options.name === 'string' ? options.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'endb';
    this.fileName = typeof options.fileName === 'string' ? options.fileName.replace(/[^a-zA-Z0-9]/g, '') : 'endb';
    this.path = typeof options.path === 'string' ? resolve(process.cwd(), options.path) : resolve(process.cwd(), './');
    this.fileMustExist = typeof options.fileMustExist === 'boolean' ? options.fileMustExist : false;
    this.timeout = typeof options.timeout === 'number' ? options.timeout : 5000;
    this.wal = typeof options.wal === 'boolean' ? options.wal : true;
    this.isReady = false;
    this.onReady = new Promise(res => this.ready = res);
    this.isDestroyed = false;
    if (!existsSync(this.path)) mkdirSync(this.path);
    if (this.fileMustExist === true && !existsSync(this.fileName)) {
      throw new EndbError(`${this.fileName} does not exist in the directory`);
    }
    this.db = new SQLite(`${this.path}${sep}${this.fileName}.db`, {
      fileMustExist: this.fileMustExist,
      timeout: this.timeout
    });
    this.init(this.db);
  }

  /**
   * Gets the number of rows in the database
   * @returns The number of rows in the database
   */
  get count(): number {
    const data: any = this.db.prepare(`SELECT count(*) FROM ${this.name};`).get();
    return data['count(*)'];
  }

  /**
   * Gets all the indexes (keys) from the database
   * @returns The indexes (keys) from the database
   */
  get indexes(): Array<string> {
    const data: Array<any> = this.db.prepare(`SELECT key FROM ${this.name};`).all();
    return data.map(row => row.key);
  }

  /**
   * Deletes all the elements from the database
   * @returns undefined
   * ```javascript
   * Endb.clear();
   * ```
   */
  public clear(): void {
    return this.deleteAll();
  }

  /**
   * Shuts down the database.
   * WARNING: USING THE METHOD MAKES THE DATABASE UNUSEABLE
   * @returns undefined
   * ```javascript
   * Endb.close().then(console.log).catch(console.error);
   * ```
   */
  public close(): void {
    this.readyCheck();
    this.db.close();
    return undefined;
  }

  /**
   * Deletes a key of an element
   * @param key The key of an element
   * @returns Whether or not, the key has been deleted
   * ```javascript
   * Endb.delete('key');
   * ```
   */
  public delete(key: string | number): boolean {
    this.readyCheck();
    if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
      throw new EndbError('Key must be a string or number', 'EndbTypeError');
    }
    const data: object = this.db.prepare(`DELETE FROM ${this.name} WHERE key = ?;`).run(key);
    return typeof data !== null ? true : false;
  }

  /**
   * Deletes all the elements from the database
   * @returns undefined
   * ```javascript
   * Endb.deleteAll();
   * ```
   */
  public deleteAll(): void {
    this.readyCheck();
    this.db.prepare(`DELETE FROM ${this.name};`).run();
    return undefined;
  }

  /**
   * Destroys the entire database and deletes the database elements
   * WARNING: THIS METHOD WILL DESTROY YOUR DATA AND CANNOT BE UNDONE
   * @returns undefined
   * ```javascript
   * Endb.destroy();
   * ```
   */
  public destroy(): void {
    this.deleteAll();
    this.isDestroyed = true;
    this.db.prepare(`DROP TABLE IF EXISTS ${this.name};`).run();
    return undefined;
  }

  /**
   * Exports the database to JSON
   * @returns The data consisting of additional information and the elements
   * ```javascript
   * Endb.export();
   * ```
   */
  public export(): string {
    this.readyCheck();
    return JSON.stringify({
      name: this.name,
      fileName: this.fileName,
      exportData: Date.now(),
      data: this.getAll()
    }, null, 2);
  }


  /**
   * Finds a key matching the prefix supplied
   * @param prefix The prefix term to search for
   * @returns 
   * ```javascript
   * Endb.find('key');
   * ```
   */
  public find(prefix: string | number): object | null {
    this.readyCheck();
    if (prefix == null || !['String', 'Number'].includes(prefix.constructor.name)) {
      throw new EndbError('Prefix must be a string or number', 'EndbTypeError');
    }
    const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key LIKE (?);`).all([`${prefix}%`]);
    if (!data) return null;
    var row: any = {};
    for (let i in data) {
      row[i] = JSON.parse(data[i].value);
    }
    return row;
  }

  /**
   * Gets a value of a specified key
   * @param key The key of the element
   * @returns The value of the key.
   * ```javascript
   * const data = Endb.get('key');
   * console.log(data);
   * ```
   */
  public get(key: string | number): object | null {
    this.readyCheck();
    if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
      throw new EndbError('Key must be a string or number', 'EndbTypeError');
    }
    const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`).get(key);
    if (!data) return null;
    try {
      data.value = JSON.parse(data.value);
    } catch { }
    return data.value;
  }

  /**
   * Gets all the element consisting of keys and elements from the database
   * @returns An array object consisting of all the elements of the database.
   * Returns empty if the database is empty
   * ```typescript
   * const data = Endb.getAll();
   * console.log(data);
   * ```
   */
  public getAll(): Array<object> {
    this.readyCheck();
    const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key IS NOT NULL`).all();
    return data;
  }

  /**
   * Returns whether or not the specified key exists
   * @param key The key of an element
   * @returns Whether or not, the element with the key exists in the database
   * ```typescript
   * Endb.has('key');
   * if (Endb.has('key')) {
   *  // ...
   * }
   * ```
   */
  public has(key: string | number): boolean {
    this.readyCheck();
    if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
      throw new EndbError('Key must be a string or number', 'EndbTypeError');
    }
    const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`).get(key);
    return data ? true : false;
  }

  static multi(names: Array<string>, options: object = {}): Array<Endb> {
    if (!names.length || names.length < 1) {
      throw new EndbError('Names must be an array of names [string]', 'EndbTypeError');
    }
    const obj: any = {};
    for (const name of names) {
      const database = new Endb({ name, ...options });
      obj[name] = database;
    }
    return obj;
  }

  /**
   * Sets an element containing a key and a value
   * @param key The key of the element
   * @param value The value of the element
   * @returns An object containing the key and the value
   * ```javascript
   * Endb.set('key', 'value');
   * Endb.set('userExists', true);
   * Endb.set('profile', {
   *   id: 1234567890,
   *   username: 'user',
   *   description: 'a user',
   *   verified: true
   * });
   * Endb.set('keyArray', [ 'one', 'two', 3, 'four' ]);
   * ```
   */
  public set(key: string | number, value: any): object {
    this.readyCheck();
    if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
      throw new EndbError('Key must be a string or number', 'EndbKeyTypeError');
    }
    this.db.prepare(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?);`).run(key, JSON.stringify(value));
    return {
      key,
      value
    };
  }

  private async init(db = this.db): Promise<Function> {
    this.db = db;
    if (this.db) {
      this.isReady = true;
    } else {
      throw new EndbError('Database could not be loaded', 'EndbConnectionError');
    }
    const table = this.db.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?;`).get(this.name);
    if (!table['count(*)']) {
      this.db.prepare(`CREATE TABLE ${this.name} (key TEXT PRIMARY KEY, value TEXT);`).run();
      if (this.wal) {
        this.db.pragma('synchronous = 1');
        this.db.pragma('journal_mode = wal');
      }
    }
    this.ready();
    return this.onReady;
  }

  private readyCheck(): void {
    if (!this.isReady) throw new EndbError('Database is not ready. Refer to the documentation to use Endb.onReady', 'EndbConnectionError');
    if (this.isDestroyed) throw new EndbError('Database has been destroyed', 'EndbConnectionError');
  }
}