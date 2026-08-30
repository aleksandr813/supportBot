const test = require('node:test');
const assert = require('node:assert/strict');
const sqlite3 = require('sqlite3').verbose();
const ORM = require('../application/modules/db/ORM');

function createOrm() {
    const db = new sqlite3.Database(':memory:');
    const orm = new ORM(db);
    return new Promise((resolve, reject) => {
        db.run(
            'CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, role TEXT)',
            err => err ? reject(err) : resolve(orm)
        );
    });
}

test('ORM insert/get/update/delete round trip', async () => {
    const orm = await createOrm();

    const inserted = await orm.insert('users', { name: 'Alice', role: 'admin' });
    assert.equal(inserted.changes, 1);

    const found = await orm.get('users', { id: inserted.id });
    assert.equal(found.name, 'Alice');
    assert.equal(found.role, 'admin');

    await orm.update('users', { role: 'moderator' }, { id: inserted.id });
    const updated = await orm.get('users', { id: inserted.id });
    assert.equal(updated.role, 'moderator');

    const count = await orm.count('users');
    assert.equal(count, 1);

    await orm.delete('users', { id: inserted.id });
    const afterDelete = await orm.get('users', { id: inserted.id });
    assert.equal(afterDelete, null);
});

test('ORM all/raw and missing get() return null/[]', async () => {
    const orm = await createOrm();

    await orm.insert('users', { name: 'Bob', role: 'user' });
    await orm.insert('users', { name: 'Carol', role: 'user' });

    const users = await orm.all('users', { role: 'user' }, { order: 'name ASC' });
    assert.deepEqual(users.map(u => u.name), ['Bob', 'Carol']);

    const rawUsers = await orm.raw('SELECT name FROM users ORDER BY name DESC');
    assert.deepEqual(rawUsers.map(u => u.name), ['Carol', 'Bob']);

    const missing = await orm.get('users', { id: 999 });
    assert.equal(missing, null);
});
