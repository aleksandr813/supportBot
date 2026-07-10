const MESSAGES = require('../messages');
const SessionStore = require('../services/sessionStore');
const { phoneKeyboard } = require('../keyboards');
const { getExternalId, getUsername, getErrorMessage } = require('../utils');
const { showRoleSelection } = require('../flows');

const USER_ALREADY_EXISTS = 501;

function createContactHandler(server) {
    return async function handleContact(ctx) {
        const externalId = getExternalId(ctx);
        const session = SessionStore.get(externalId);

        if (!session?.awaitingPhone && !ctx.contactInfo) {
            return;
        }

        const phone = ctx.contactInfo?.tel;
        if (!phone) {
            return ctx.reply(MESSAGES.PHONE_MISSING, { attachments: [phoneKeyboard] });
        }

        const result = await server.addUser(externalId, getUsername(ctx), phone);

        if (result.result === 'error' && result.error?.code !== USER_ALREADY_EXISTS) {
            return ctx.reply(getErrorMessage(result));
        }

        return showRoleSelection(ctx);
    };
}

module.exports = createContactHandler;