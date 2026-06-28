const CONFIG = require('../../../config');

class User {
    constructor(options) {
        const { username, botId, userId, callbacks } = options;

        this.username = username;
        this.botId = botId;
        this.userId = userId;
        this.callbacks = callbacks || {};

        this.init(options);
    }

    get() {
        return {
            username: this.username,
            botId: this.botId,
            userId: this.userId,
        }
    }
}

module.exports = User;