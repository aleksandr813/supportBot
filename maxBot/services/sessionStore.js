const sessions = new Map();

const SessionStore = {
    get(externalId) {
        return sessions.get(externalId);
    },

    setAwaitingPhone(externalId) {
        sessions.set(externalId, { awaitingPhone: true });
    },

    setAwaitingRole(externalId) {
        sessions.set(externalId, { awaitingRole: true });
    },

    isAwaitingPhone(externalId) {
        return sessions.get(externalId)?.awaitingPhone === true;
    },

    isAwaitingRole(externalId) {
        return sessions.get(externalId)?.awaitingRole === true;
    },

    clear(externalId) {
        sessions.delete(externalId);
    },
};

module.exports = SessionStore;