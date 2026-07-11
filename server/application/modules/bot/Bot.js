class Bot {
    constructor(options) {
        const { bot_guid, token, adress, port, callbacks } = options;

        this.guid = bot_guid;
        this.token = token;
        this.adress = adress;
        this.port = port;
        this.callbacks = callbacks || {};
    }

    get() {
        return {
            guid: this.guid,
            token: this.token,
            adress: this.adress,
            port: this.port,
        }
    }

    async sendMessage(text, externalId, conversationGuid, userGuid) {
        const message = {
            text: text,
            externalId: externalId,
        };

        const response = await fetch(`${this.adress}:${this.port}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: this.token, ...message }),
        });

        if (response && response?.error) {
            console.log(response.error);
            return false;
        }

        this.callbacks.addMessage(text, conversationGuid, userGuid);
        return true;
    }
}

module.exports = Bot;