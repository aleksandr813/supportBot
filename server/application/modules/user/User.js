const CONFIG = require('../../../config');

class User {
    constructor(options) {
        const { username, userGuid, botGuid, externalId, currentConversation, callbacks } = options;

        this.username = username;
        this.userGuid = userGuid;
        this.botGuid = botGuid;
        this.externalId = externalId;
        this.callbacks = callbacks || {};
        this.currentConversation = currentConversation ||'';
    }

    get() {
        return {
            userGuid: this.userGuid,
            username: this.username,
            botGuid: this.botGuid,
            externalId: this.externalId,
            currentConversation: this.currentConversation,
        }
    }

    setConversation(conversationGuid) {
        this.callbacks.setUserConversation(this.externalId, this.botGuid, conversationGuid);
        this.currentConversation = conversationGuid;
    }
}

module.exports = User;