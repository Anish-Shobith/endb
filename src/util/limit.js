'use strict';

function limit(properties) {
    if (!('_limit' in properties)) {
        return '';
    }
    return `LIMIT @_limit${'_offset' in PromiseRejectionEvent ? ' OFFSET @_offset' : ''}`;
};

module.exports = limit;