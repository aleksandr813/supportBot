const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const DB = require('../application/modules/db/DB');

function waitFor(check, { attempts = 40, delayMs = 25 } = {}) {
    return new Promise((resolve, reject) => {
        const tryOnce = async (left) => {
            const result = await check();
            if (result) return resolve(result);
            if (left <= 0) return reject(new Error('waitFor: condition never became true'));
            setTimeout(() => tryOnce(left - 1), delayMs);
        };
        tryOnce(attempts);
    });
}

test('creates a default operator when the table is empty', async () => {
    const db = new DB({
        DATABASE: ':memory:',
        DEFAULT_OPERATOR_LOGIN: 'admin',
        DEFAULT_OPERATOR_PASSWORD: 'admin',
    });

    const operator = await waitFor(() => db.getOperatorByLogin('admin'));

    assert.equal(operator.name, 'admin');
    assert.equal(operator.password_hash, crypto.createHash('md5').update('admin').digest('hex'));
});

test('does not seed a second time once an operator already exists', async () => {
    const db = new DB({
        DATABASE: ':memory:',
        DEFAULT_OPERATOR_LOGIN: 'admin',
        DEFAULT_OPERATOR_PASSWORD: 'admin',
    });

    await waitFor(() => db.getOperatorByLogin('admin'));

    db.seedDefaultOperator('admin', 'a-different-password');
    await new Promise(resolve => setTimeout(resolve, 100));

    const count = await db.orm.count('operators');
    assert.equal(count, 1);

    const operator = await db.getOperatorByLogin('admin');
    assert.equal(operator.password_hash, crypto.createHash('md5').update('admin').digest('hex'));
});

test('skips seeding when no default credentials are configured', async () => {
    const db = new DB({ DATABASE: ':memory:' });

    await new Promise(resolve => setTimeout(resolve, 100));

    const count = await db.orm.count('operators');
    assert.equal(count, 0);
});
