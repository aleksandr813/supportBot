const { requestPhone, showRoleSelection } = require('../flows');
const { getExternalId } = require('../utils');
const SessionStore = require('../services/sessionStore');

function createStartHandler(server) {
    return async function handleStart(ctx) {
        const externalId = getExternalId(ctx);
        SessionStore.clear(externalId);

        const userResult = await server.getUser(externalId);

        if (userResult.result === 'ok' && userResult.data?.phone) {
            return showRoleSelection(ctx);
        }

        return requestPhone(ctx);
    };
}

module.exports = createStartHandler;