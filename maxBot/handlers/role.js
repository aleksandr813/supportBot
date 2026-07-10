const MESSAGES = require('../messages');
const CONFIG = require('../config');
const server = require('../server');
const SessionStore = require('../sessionStore');
const { getExternalId, getErrorMessage } = require('../utils');

const { ROLES } = CONFIG;

const ACTIVE_CONVERSATION_EXISTS = 502;

async function handleRoleSelection(ctx) {
    const externalId = getExternalId(ctx);
    const roleKey = ctx.match?.[1];
    const role = ROLES[roleKey];

    if (!role) {
        await ctx.answerOnCallback({ notification: MESSAGES.UNKNOWN_ROLE });
        return;
    }

    const result = await server.createConversation(externalId, role);

    if (result.result === 'error') {
        await ctx.answerOnCallback({ notification: getErrorMessage(result) });
        if (result.error?.code === ACTIVE_CONVERSATION_EXISTS) {
            await ctx.reply(MESSAGES.ALREADY_ACTIVE);
        }
        return;
    }

    SessionStore.clear(externalId);
    await ctx.answerOnCallback({ notification: MESSAGES.CONVERSATION_CREATED });
    return ctx.reply(MESSAGES.INSTRUCTION);
}

module.exports = { handleRoleSelection };