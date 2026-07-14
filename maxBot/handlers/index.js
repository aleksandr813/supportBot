const { handleStart } = require('./start');
const createContactHandler = require('./contact');
const createRoleHandler = require('./role');
const createCloseHandler = require('./close');
const createMessageHandler = require('./message');

function createHandlers(server, bot) {
    return {
        handleStart,
        handleContact: createContactHandler(server),
        handleRoleSelection: createRoleHandler(server),
        handleClose: createCloseHandler(server),
        handleUserMessage: createMessageHandler(server, bot),
    };
}

module.exports = createHandlers;