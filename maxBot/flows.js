const MESSAGES = require('./messages');
const SessionStore = require('./services/sessionStore');
const { phoneKeyboard, roleKeyboard } = require('./keyboards');
const { getExternalId } = require('./utils');

async function requestPhone(ctx) {
    SessionStore.setAwaitingPhone(getExternalId(ctx));
    return ctx.reply(MESSAGES.WELCOME, { attachments: [phoneKeyboard] });
}

async function showRoleSelection(ctx) {
    SessionStore.setAwaitingRole(getExternalId(ctx));
    return ctx.reply(MESSAGES.ROLE_PROMPT, { attachments: [roleKeyboard] });
}

module.exports = { requestPhone, showRoleSelection };