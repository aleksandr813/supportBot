const CONFIG = require('../config');

class Server {
    constructor(host) {
        this.host = host;
    }

    async request(path, body = {}) {
        const response = await fetch(`${this.host}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: CONFIG.SERVER_TOKEN, ...body }),
        });

        const data = await response.json();

        if (data?.result === 'error') {
            console.error(data);
        }

        return data;
    }

    addUser(externalId, username, phone) {
        return this.request('/addUser', { externalId, username, phone });
    }

    getUser(externalId) {
        return this.request('/getUser', { externalId });
    }

    createConversation(externalId, role) {
        return this.request('/createConversation', { externalId, role });
    }

    endConversation(externalId) {
        return this.request('/endConversation', { externalId });
    }

    sendMessage(externalId, text, attachments) {
        return this.request('/newMessage', { externalId, text, attachments });
    }
}

module.exports = Server;