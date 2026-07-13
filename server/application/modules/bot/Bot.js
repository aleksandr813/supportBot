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

    getBaseUrl() {
        const host = /^https?:\/\//i.test(this.adress) ? this.adress : `http://${this.adress}`;
        return `${host}:${this.port}`;
    }

    async sendMessage(text, externalId, conversationGuid, userGuid) {
        const message = {
            text: text,
            externalId: externalId,
        };

        try {
            const response = await fetch(`${this.getBaseUrl()}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token, ...message }),
            });

            const data = await response.json();

            if (data?.result === 'error') {
                console.log(data.error);
                return false;
            }

            await this.callbacks.addMessage(text, conversationGuid, userGuid);
            return true;
        } catch (error) {
            console.error(`Failed to send message to bot at ${this.getBaseUrl()}:`, error.message);
            return false;
        }
    }
}

module.exports = Bot;