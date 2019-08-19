'use strict';

module.exports = function(text) {
    return JSON.parse(text, (key, value) => {
        if ('string' === typeof value) {
            if (/^:base64:/.test(value))
                return Buffer.from(value.substring(8), 'base64');
        } else {
            return /^:/.test(value) ? value.substring(1) : value;
        }
        return value;
    });
};