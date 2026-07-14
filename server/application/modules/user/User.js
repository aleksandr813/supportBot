const CONFIG = require('../../../config');

class User {
    constructor(options) {
        const { username, userGuid, botGuid, externalId, currentConversation, phone, isBlocked, callbacks } = options;

        this.username = username;
        this.userGuid = userGuid;
        this.botGuid = botGuid;
        this.externalId = externalId;
        this.callbacks = callbacks || {};
        this.currentConversation = currentConversation ||'';
        this.phone = phone || '';
        this.isBlocked = isBlocked || 0;
    }

    get() {
        return {
            userGuid: this.userGuid,
            username: this.username,
            botGuid: this.botGuid,
            externalId: this.externalId,
            currentConversation: this.currentConversation,
            phone: this.phone,
            isBlocked: this.isBlocked,
        }
    }

    setConversation(conversationGuid) {
        this.callbacks.setUserConversation(this.externalId, this.botGuid, conversationGuid);
        this.currentConversation = conversationGuid;
    }
}

module.exports = User;