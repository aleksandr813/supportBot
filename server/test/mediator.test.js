const test = require('node:test');
const assert = require('node:assert/strict');
const Mediator = require('../application/modules/Mediator');

function createMediator() {
    return new Mediator({
        EVENTS: { PING: 'PING' },
        TRIGGERS: { GET_ANSWER: 'GET_ANSWER' },
    });
}

test('subscribe/call invokes the first registered handler and returns its result', () => {
    const mediator = createMediator();
    const calls = [];

    const handler = (data) => { calls.push(data); return 'handled'; };
    mediator.subscribe('PING', handler);

    const result = mediator.call('PING', { value: 1 });

    assert.equal(result, 'handled');
    assert.deepEqual(calls, [{ value: 1 }]);
});

test('unsubscribe removes a handler so it stops receiving calls', () => {
    const mediator = createMediator();
    let callCount = 0;
    const handler = () => { callCount += 1; };

    mediator.subscribe('PING', handler);
    mediator.call('PING');
    mediator.unsubscribe('PING', handler);
    mediator.call('PING');

    assert.equal(callCount, 1);
});

test('set/get wires a trigger and returns null when none is set', () => {
    const mediator = createMediator();

    assert.equal(mediator.get('GET_ANSWER'), null);

    mediator.set('GET_ANSWER', (data) => `answer:${data}`);
    assert.equal(mediator.get('GET_ANSWER', 42), 'answer:42');
});
