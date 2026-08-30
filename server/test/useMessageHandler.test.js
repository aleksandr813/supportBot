const test = require('node:test');
const assert = require('node:assert/strict');
const useMessageHandler = require('../application/router/handlers/useMessageHandler');
const Answer = require('../application/answer');

function createFakeMediator({ bot = { guid: 'bot-1' }, callResult = null } = {}) {
    const calls = [];
    return {
        calls,
        getEventTypes: () => ({ NEW_MESSAGE: 'NEW_MESSAGE' }),
        getTriggerTypes: () => ({ GET_BOT_BY_TOKEN: 'GET_BOT_BY_TOKEN' }),
        get: (_trigger, token) => (token ? bot : null),
        call: async (_event, data) => { calls.push(data); return callResult; },
    };
}

function createFakeRes() {
    const res = { body: null };
    res.send = (data) => { res.body = data; return res; };
    return res;
}

test('rejects a request with an unknown bot token', async () => {
    const answer = new Answer();
    const mediator = createFakeMediator({ bot: null });
    const handler = useMessageHandler(answer, mediator);

    const res = createFakeRes();
    await handler({ body: { token: 'nope', externalId: '1', text: 'hi' } }, res);

    assert.equal(res.body.result, 'error');
    assert.equal(res.body.error.code, 403);
});

test('rejects a request missing externalId/text', async () => {
    const answer = new Answer();
    const mediator = createFakeMediator();
    const handler = useMessageHandler(answer, mediator);

    const res = createFakeRes();
    await handler({ body: { token: 'good' } }, res);

    assert.equal(res.body.error.code, 242);
});

test('forwards a valid message and does not leak request fields onto globals', async () => {
    const answer = new Answer();
    const mediator = createFakeMediator({ callResult: answer.good(true) });
    const handler = useMessageHandler(answer, mediator);

    const res = createFakeRes();
    await handler({ body: { token: 'good', externalId: '42', text: 'hello' } }, res);

    assert.equal(res.body.result, 'ok');
    assert.deepEqual(mediator.calls[0], { token: 'good', externalId: '42', text: 'hello' });

    assert.equal(typeof globalThis.token, 'undefined');
    assert.equal(typeof globalThis.externalId, 'undefined');
    assert.equal(typeof globalThis.text, 'undefined');
});

test('two concurrent requests never mix up each other\'s fields', async () => {
    const answer = new Answer();
    const mediator = createFakeMediator({ callResult: answer.good(true) });
    const handler = useMessageHandler(answer, mediator);

    await Promise.all([
        handler({ body: { token: 'good', externalId: 'user-a', text: 'from A' } }, createFakeRes()),
        handler({ body: { token: 'good', externalId: 'user-b', text: 'from B' } }, createFakeRes()),
    ]);

    const externalIds = mediator.calls.map(c => c.externalId).sort();
    assert.deepEqual(externalIds, ['user-a', 'user-b']);
});
