const CONFIG = require('../../../config');

class Bot {
    constructor(options) {
        const { botId, token } = options;

        this.botId = botId;
        this.token = token;
    }

    get() {
        return {
            botId: this.botId,
        }
    }
}

module.exports = Bot;