// !OUTDATED!
// Requires Update

declare module 'endb' {

    /**
     * A simplified & powerful key-value database wrapper for ease-of-use
     */
    export class Endb {
        constructor(options?: object);
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
}