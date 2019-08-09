'use strict';

function order(properties) {
    if (!properties._sort) {
        return '';
    }
    const sort = A(properties._sort).map(part => {
        const bits = part.split(':');
        return {
            name: bits.shift(),
            dir: bits.join(':').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
        };
    });
    return `ORDER BY ${sort.map(part => `\`${part.name}\` ${part.dir}`).join(', ')}`;
};

module.exports = order;