'use strict'

module.exports = {
    stringify: function(obj) {
        if ('undefined' == typeof obj) return obj;
        if (obj && Buffer.isBuffer(obj)) {
            return JSON.stringify(':base64:' + obj.toString('base64'));
        }
        if (obj && obj.toJSON) obj = obj.toJSON();
        if (obj && 'object' === typeof obj) {
            let s = '';
            const array = Array.isArray(obj);
            s = array ? '[' : '{';
            let first = true;
            for (const k in obj) {
                const ignore = 'function' == typeof obj[k] || (!array && 'undefined' === typeof obj[k]);
                if (Object.hasOwnProperty.call(obj, k) && !ignore) {
                    if (!first) s += ',';
                    first = false;
                    if (array) {
                        if (obj[k] == undefined) {
                            s += 'null';
                        } else {
                            s += stringify(obj[k]);
                        }
                    } else if (obj[k] !== void(0)) {
                        s += stringify(k) + ':' + stringify(obj[k]);
                    }
                }
            }
            s += array ? ']' : '}';
            return s;
        } else if ('string' === typeof obj) {
            return JSON.stringify(/^:/.test(obj) ? ':' + obj : obj);
        } else if ('undefined' === typeof obj) {
            return 'null';
        } else {
            return JSON.stringify(obj);
        }
    },
    parse: function(text) {
        return JSON.parse(text, (key, value) => {
            if ('string' === typeof value) {
                if (/^:base64:/.test(value))
                    return Buffer.from(value.substring(8), 'base64');
            } else {
                return /^:/.test(value) ? value.substring(1) : value;
            }
            return value;
        });
    },
    safeRequire(module) {
        try {
            return require(module);
        } catch (err) {
            throw new Error(`Run "npm i ${module}" to install the package`);
        }
    }
}