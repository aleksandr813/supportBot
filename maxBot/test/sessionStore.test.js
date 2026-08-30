const test = require('node:test');
const assert = require('node:assert/strict');
const SessionStore = require('../services/sessionStore');

test('tracks awaiting-phone and awaiting-role state per user', () => {
    const externalId = 'user-1';

    assert.equal(SessionStore.isAwaitingPhone(externalId), false);
    assert.equal(SessionStore.isAwaitingRole(externalId), false);

    SessionStore.setAwaitingPhone(externalId);
    assert.equal(SessionStore.isAwaitingPhone(externalId), true);
    assert.equal(SessionStore.isAwaitingRole(externalId), false);

    SessionStore.setAwaitingRole(externalId);
    assert.equal(SessionStore.isAwaitingRole(externalId), true);
    assert.equal(SessionStore.isAwaitingPhone(externalId), false);

    SessionStore.clear(externalId);
    assert.equal(SessionStore.isAwaitingRole(externalId), false);
    assert.equal(SessionStore.get(externalId), undefined);
});
