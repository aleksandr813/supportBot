const MESSAGES = require('../messages');
const SessionStore = require('../services/sessionStore');
const { getExternalId, getErrorMessage } = require('../utils');

function createCloseHandler(server) {
    return async function handleClose(ctx) {
        const externalId = getExternalId(ctx);
        const result = await server.endConversation(externalId);

        if (result.result === 'error') {
            return ctx.reply(getErrorMessage(result));
        }

        SessionStore.clear(externalId);
        return ctx.reply(MESSAGES.CONVERSATION_CLOSED);
    };
}

module.exports = createCloseHandler;