const CONFIG = require('../../../config');

class User {
    constructor(options) {
        const { username, botId, externalId, callbacks } = options;

        this.username = username;
        this.botId = botId;
        this.externalId = externalId;
        this.callbacks = callbacks || {};
    }

    get() {
        return {
            username: this.username,
            botId: this.botId,
            externalId: this.externalId,
        }
    }
}

module.exports = User;