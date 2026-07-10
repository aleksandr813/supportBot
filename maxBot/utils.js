const MESSAGES = require('./messages');

function getExternalId(ctx) {
    return String(ctx.user.user_id);
}

function getUsername(ctx) {
    return ctx.user?.name || ctx.user?.username || ctx.contactInfo?.fullName || 'Пользователь';
}

function getErrorMessage(result) {
    return result.error?.message || MESSAGES.ERROR;
}

module.exports = { getExternalId, getUsername, getErrorMessage };