const test = require('node:test');
const assert = require('node:assert/strict');
const OperatorManager = require('../application/modules/operator/OperatorManager');
const Answer = require('../application/answer');
const Common = require('../application/modules/common/Common');

function createFakeMediator() {
    const triggers = {};
    return {
        getEventTypes: () => ({}),
        getTriggerTypes: () => ({}),
        set: (name, fn) => { triggers[name] = fn; },
        get: (name, data) => (triggers[name] ? triggers[name](data) : null),
    };
}

function createManager(db = {}) {
    const fullDb = {
        getOperatorByLogin: async (name) => ({ operator_guid: 'guid-1', name, password_hash: 'hash' }),
        ...db,
    };
    const mediator = createFakeMediator();
    const manager = new OperatorManager({ mediator, db: fullDb, common: new Common(), answer: new Answer(), io: null });
    return { manager, mediator, db: fullDb };
}

test('a stale socket disconnecting after reconnect does not kill a still-active session', async () => {
    const { manager, mediator } = createManager();

    const socketA = { id: 'socket-A', emit: () => {} };
    await manager.socketLogin({ name: 'admin', passwordHash: 'hash' }, socketA);

    const operator = Object.values(manager.operators)[0];
    const { token, guid } = operator.get();

    // client reconnects on a new socket and makes a request that re-validates the token,
    // which is what every real socket handler does via checkOperatorToken()
    const socketB = { id: 'socket-B' };
    assert.equal(mediator.get('CHECK_OPERATOR_TOKEN', { token, guid, socketId: socketB.id }), true);

    // the OLD socket's disconnect event arrives late
    manager.handleDisconnect(socketA);

    // session must survive, since it now belongs to socket-B
    assert.equal(mediator.get('CHECK_OPERATOR_TOKEN', { token, guid, socketId: socketB.id }), true);
});

test('the current socket disconnecting still clears the session', async () => {
    const { manager, mediator } = createManager();

    const socketA = { id: 'socket-A', emit: () => {} };
    await manager.socketLogin({ name: 'admin', passwordHash: 'hash' }, socketA);
    const { token, guid } = Object.values(manager.operators)[0].get();

    manager.handleDisconnect(socketA);

    assert.equal(mediator.get('CHECK_OPERATOR_TOKEN', { token, guid }), false);
    assert.equal(Object.keys(manager.operators).length, 0);
});

test('a session survives the server process restarting (token persisted in the DB)', async () => {
    // simulates the sqlite "operators" table: login() writes the issued token here
    const operatorsTable = { 'guid-1': { operator_guid: 'guid-1', name: 'admin', password_hash: 'hash', token: null } };
    const sharedDb = {
        getOperatorByLogin: async (name) => operatorsTable['guid-1'],
        setOperatorToken: async (guid, token) => { operatorsTable[guid].token = token; },
        getActiveOperators: async () => Object.values(operatorsTable).filter(o => o.token),
    };

    const { manager: managerBeforeRestart } = createManager(sharedDb);
    const socketA = { id: 'socket-A', emit: () => {} };
    await managerBeforeRestart.socketLogin({ name: 'admin', passwordHash: 'hash' }, socketA);
    const { token, guid } = Object.values(managerBeforeRestart.operators)[0].get();

    // "restart": a brand new OperatorManager (new in-memory `operators` map) backed by the same DB
    const { manager: managerAfterRestart, mediator: mediatorAfterRestart } = createManager(sharedDb);
    await managerAfterRestart.restoreActiveOperators();

    assert.equal(mediatorAfterRestart.get('CHECK_OPERATOR_TOKEN', { token, guid, socketId: 'socket-B' }), true);
});
