const MESSAGES = require('../messages');
const SessionStore = require('../services/sessionStore');
const { phoneKeyboard, roleKeyboard } = require('../keyboards');
const { getExternalId, getErrorMessage } = require('../utils');
const { requestPhone, showRoleSelection } = require('../flows');

// Коды ошибок бэкенда, требующие вернуть пользователя на предыдущий шаг сценария
const ERROR_CODES = {
    PHONE_REQUIRED: 503,
    ROLE_REQUIRED: 504,
};

function createMessageHandler(server) {
    return async function handleUserMessage(ctx) {
        const text = ctx.message?.body?.text?.trim();
        if (!text) {
            return;
        }

        const externalId = getExternalId(ctx);

        if (SessionStore.isAwaitingPhone(externalId)) {
            return ctx.reply(MESSAGES.PHONE_PROMPT_RETRY, { attachments: [phoneKeyboard] });
        }

        if (SessionStore.isAwaitingRole(externalId)) {
            return ctx.reply(MESSAGES.ROLE_PROMPT_RETRY, { attachments: [roleKeyboard] });
        }

        const result = await server.sendMessage(externalId, text);

        if (result.result === 'error') {
            if (result.error?.code === ERROR_CODES.PHONE_REQUIRED) {
                return requestPhone(ctx);
            }
            if (result.error?.code === ERROR_CODES.ROLE_REQUIRED) {
                return showRoleSelection(ctx);
            }
            return ctx.reply(getErrorMessage(result));
        }
    };
}

module.exports = createMessageHandler;