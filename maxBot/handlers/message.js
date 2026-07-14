const MESSAGES = require('../messages');
const CONFIG = require('../config');
const SessionStore = require('../services/sessionStore');
const { phoneKeyboard, roleKeyboard } = require('../keyboards');
const { getExternalId, getErrorMessage } = require('../utils');
const { requestPhone, showRoleSelection } = require('../flows');

const { PHONE_REQUIRED, ROLE_REQUIRED } = CONFIG.ERROR_CODES;

function createMessageHandler(server, bot) {
    return async function handleUserMessage(ctx) {
        const text = ctx.message?.body?.text?.trim() || '';
        let attachments = ctx.message?.body?.attachments || [];
        if (!text && attachments.length === 0) {
            return;
        }

        if (attachments.length > 0 && ctx.message?.body?.mid) {
            try {
                const freshMessage = await bot.api.getMessage(ctx.message.body.mid);
                if (freshMessage?.body?.attachments) {
                    attachments = freshMessage.body.attachments;
                }
            } catch (err) {
                console.error("Failed to fetch fresh message details for attachments:", err);
            }
        }

        if (attachments.length > 1) {
            return ctx.reply(MESSAGES.LIMIT_EXCEEDED);
        }

        const externalId = getExternalId(ctx);

        if (SessionStore.isAwaitingPhone(externalId)) {
            return ctx.reply(MESSAGES.PHONE_PROMPT_RETRY, { attachments: [phoneKeyboard] });
        }

        if (SessionStore.isAwaitingRole(externalId)) {
            return ctx.reply(MESSAGES.ROLE_PROMPT_RETRY, { attachments: [roleKeyboard] });
        }

        const result = await server.sendMessage(externalId, text, attachments);

        if (result.result === 'error') {
            if (result.error?.code === PHONE_REQUIRED) {
                return requestPhone(ctx);
            }
            if (result.error?.code === ROLE_REQUIRED) {
                return showRoleSelection(ctx);
            }
            return ctx.reply(getErrorMessage(result));
        }
    };
}

module.exports = createMessageHandler;