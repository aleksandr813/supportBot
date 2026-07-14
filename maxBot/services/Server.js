const CONFIG = require('../config');

class Server {
    constructor(host) {
        this.host = host;
    }

    async request(path, body = {}) {
        try {
            const response = await fetch(`${this.host}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: CONFIG.SERVER_TOKEN, ...body }),
            });

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                console.error(`Server request failed at path ${path}. Status: ${response.status}, Body: ${text}`);
                return { result: 'error', error: { message: `HTTP Error: ${response.status}` } };
            }

            const data = await response.json();

            if (data?.result === 'error') {
                console.error(data);
            }

            return data;
        } catch (error) {
            console.error(`Request to server failed at path ${path}:`, error);
            return { result: 'error', error: { message: error.message } };
        }
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