export class EndbError extends Error {
    public message: any;
    public name: string;
    constructor(message: any, name: string = 'EndbError') {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.message = message;
        this.name = name;
    }
}