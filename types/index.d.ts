declare module 'endb' {

  import { EventEmitter } from 'events';

  export class Endb extends EventEmitter {
    constructor(uri?: string, options?: Options);
    public options: Options;
    public dialect: MongoDialect | MysqlDialect | PostgresDialect | RedisDialect | SqliteDialect;
    public clear(): Promise<void>;
    public delete(key: string | number): Promise<true>;
    public deleteAll(): Promise<void>;
    public get(key: string | number): Promise<any>;
    public getDialect(): string;
    public set(key: string | number, value: any): Promise<boolean>;
    private _prefixKey(key: string | number): string;
  }
  
  class MongoDialect extends EventEmitter {
    constructor(options?: Options);
    public options: Options;
    public db: any;
    public mongo: object;
    public all(): any;
    public clear(): Promise<void>;
    public delete(key: string | number): Promise<true>;
    public get(key: string | number): Promise<any>;
    public set(key: string | number, value: any): Promise<boolean>;
  }
  
  class SqlDialect extends EventEmitter {
    constructor(options?: Options);
    public options: Options;
    public entry: any;
    public query: Function;
    public clear(): Promise<void>;
    public delete(key: string | number): Promise<true>;
    public get(key: string | number): Promise<any>;
    public set(key: string | number): Promise<boolean>;
  }
  
  class MysqlDialect extends SqlDialect {
    constructor(options?: Options);
  }
  
  class PostgresDialect extends SqlDialect {
    constructor(options?: Options);
  }
  
  class RedisDialect extends EventEmitter {
    public options: Options;
    public redis: object;
    public clear(): Promise<void>;
    public delete(key: string | number): Promise<true>;
    public get(key: string | number): Promise<any>;
    public set(key: string | number, value: any): Promise<boolean>;
  }
  
  class SqliteDialect extends SqlDialect {
    constructor(options?: Options);
  }

  interface Options {
    namespace?: string,
    serialize?: Function,
    deserialize?: Function,
    dialect?: string,
    collection?: string,
    table?: string,
    keySize?: number
  }
}
