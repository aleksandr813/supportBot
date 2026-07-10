const MESSAGES = require('../messages');
const server = require('../server');
const SessionStore = require('../sessionStore');
const { getExternalId, getErrorMessage } = require('../utils');

async function handleClose(ctx) {
    const externalId = getExternalId(ctx);
    const result = await server.endConversation(externalId);

    if (result.result === 'error') {
        return ctx.reply(getErrorMessage(result));
    }

    SessionStore.clear(externalId);
    return ctx.reply(MESSAGES.CONVERSATION_CLOSED);
}

module.exports = { handleClose };