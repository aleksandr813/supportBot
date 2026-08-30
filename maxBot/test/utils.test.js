const test = require('node:test');
const assert = require('node:assert/strict');
const { getExternalId, getUsername, getErrorMessage } = require('../utils');
const MESSAGES = require('../messages');

test('getExternalId stringifies the user id', () => {
    assert.equal(getExternalId({ user: { user_id: 12345 } }), '12345');
});

test('getUsername falls back through name, username, contact full name, then a default', () => {
    assert.equal(getUsername({ user: { name: 'Ivan' } }), 'Ivan');
    assert.equal(getUsername({ user: { username: 'ivan_the_user' } }), 'ivan_the_user');
    assert.equal(getUsername({ contactInfo: { fullName: 'Ivan Ivanov' } }), 'Ivan Ivanov');
    assert.equal(getUsername({}), 'Пользователь');
});

test('getErrorMessage prefers the server error message, falls back to a generic one', () => {
    assert.equal(getErrorMessage({ error: { message: 'Custom error' } }), 'Custom error');
    assert.equal(getErrorMessage({}), MESSAGES.ERROR);
});
