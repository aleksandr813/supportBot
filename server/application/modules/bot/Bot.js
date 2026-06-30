class Bot {
    constructor(options) {
        const { botId, token } = options;

        this.botId = botId;
        this.token = token;
    }

    get() {
        return {
            botId: this.botId,
            token: this.token,
        }
    }
}

module.exports = Bot;