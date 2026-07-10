const { handleStart } = require('./start');
const { handleContact } = require('./contact');
const { handleRoleSelection } = require('./role');
const { handleClose } = require('./close');
const { handleUserMessage } = require('./message');

module.exports = {
    handleStart,
    handleContact,
    handleRoleSelection,
    handleClose,
    handleUserMessage,
};