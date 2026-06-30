class Bot {
    constructor(options) {
        const { bot_guid, token } = options;

        this.guid = bot_guid;
        this.token = token;
    }

    get() {
        return {
            guid: this.guid,
            token: this.token,
        }
    }
}

module.exports = Bot;