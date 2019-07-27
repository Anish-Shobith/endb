'use strict';

class EndbError extends Error {
    constructor(message, name = 'EndbError') {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.message = message;
        this.name = name;
    }
}

module.exports = EndbError;