declare module 'endb' {

  import { EventEmitter } from 'events';

  export class Endb extends EventEmitter {
    constructor(uri?: string, options?: Options);
    public options: Options;
    public dialect: any;

    public clear(): Promise<void>;
    public delete(key: string | number): Promise<true>;
    public deleteAll(): Promise<void>;
    public get(key: string | number): Promise<any>;
    public getDialect(): string;
    public set(key: strging | number, value: any): Promise<boolean>
    private _prefixKey(key: string | number): string;
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