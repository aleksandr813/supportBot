class Bot {
    constructor(options) {
        const { bot_guid, token, adress, port } = options;

        this.guid = bot_guid;
        this.token = token;
        this.adress = adress;
        this.port = port;
    }

    get() {
        return {
            guid: this.guid,
            token: this.token,
            adress: this.adress,
            port: this.port,
        }
    }

    sendMessage(text, externalId) {
        const message = {
            text: text,
            externalId: externalId,
        };

        const response = await fetch(`${this.adress}:${this.port}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: this.token, ...message }),
        });

        if (response && response?.error) {
            console.log(response.error);
            //Ошибка отправки сообщения
        }
    }
}

module.exports = Bot;