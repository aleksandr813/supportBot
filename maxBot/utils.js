const MESSAGES = require('./messages');

const USER_BLOCKED_CODE = 505;

function getExternalId(ctx) {
    return String(ctx.user.user_id);
}

function getUsername(ctx) {
    return ctx.user?.name || ctx.user?.username || ctx.contactInfo?.fullName || 'Пользователь';
}

function getErrorMessage(result) {
    if (result.error?.code === USER_BLOCKED_CODE) {
        return MESSAGES.BLOCKED;
    }
    return result.error?.message || MESSAGES.ERROR;
}

module.exports = { getExternalId, getUsername, getErrorMessage };