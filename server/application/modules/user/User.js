const CONFIG = require('../../../config');

class User {
    constructor(options) {
        const { username, botGuid, externalId, callbacks } = options;

        this.username = username;
        this.botGuid = botGuid;
        this.externalId = externalId;
        this.callbacks = callbacks || {};
        this.currentConversation = '';
    }

    get() {
        return {
            username: this.username,
            botGuid: this.botGuid,
            externalId: this.externalId,
            currentConversation: this.currentConversation,
        }
    }
}

module.exports = User;