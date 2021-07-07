const db = require('../data/dbConfig');

function get(id = null) {
    if (id) {
        return db('users').where({ id });
    } else {
        return db('users');
    }
}

function getByUsername(username) {
    return db('users').where({ username });
}

async function insert(user) {
    let [id] = await db('users').insert(user);
    return get(id);
}

module.exports = {
    get,
    getByUsername,
    insert
};