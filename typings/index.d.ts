declare module 'endb' {
    export class Endb {
        constructor(options?: object);
        public readonly options: object;
        public readonly count: number;
        public readonly indexes: string[];
        public clear(): null;
        public close(): Promise<void>;
        public delete(key: string | number): boolean;
        public deleteAll(): null;
        public destroy(): null;
        public export(): string;
        public find(key: string | number): object;
        public get(key: string | number): any;
        public getAll(): any[];
        public has(key: string | number): boolean;
        public static multi(names: string[], options: object): Endb[];
        public set(key: string | number, value: any): object;
        private init(db: any): Promise<void>;
        private check(): void;
    }

    export class Model {
        constructor(options?: object);
        public readonly schema: object;
        public readonly options: object;
        public readonly name: string;
        public readonly fileName: string;
        public readonly path: string;
        public readonly fileMustExist: boolean;
        public readonly timeout: number;
        public readonly wal: boolean;
        public readonly isDestroyed: boolean;
        public readonly onReady: Promise<void>;
        public readonly isReady: boolean;
        private ready: () => void;
        private _db: any;
        public close(): void;
        public delete(conditions: object): any;
        public deleteModel(): void;
        public deleteAll(): void;
        public find(filter: object): any[];
        public insert(doc: object): object;
        public update(filter: object, clause: object): object;
        private init(db: any): Promise<void>;
        private check(): void;
    }
}