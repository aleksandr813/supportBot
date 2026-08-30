const BaseManager = require('../BaseManager');
const Bot = require('./Bot');


class BotManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeBots = {};
        this.loadBots();

        this.mediator.subscribe(this.EVENTS.SEND_MESSAGE, (data) => this.eventSendMessage(data));

        this.mediator.set(this.TRIGGERS.GET_BOT_BY_TOKEN, (data) => this.triggerGetBotByToken(data));
        this.mediator.set(this.TRIGGERS.GET_BOT_BY_USER_GUID, (data) => this.triggerGetBotByUserGuid(data));

        if (this.io) {
            this.io.on('connection', (socket) => {
                socket.on('GET_BOTS', (data) => this.socketGetBots(data, socket));
                socket.on('ADD_BOT', (data) => this.socketAddBot(data, socket));
                socket.on('UPDATE_BOT', (data) => this.socketUpdateBot(data, socket));
                socket.on('DELETE_BOT', (data) => this.socketDeleteBot(data, socket));
            });
        }
    }

    
    createBot(botData) {
        return new Bot({
            ...botData,
            callbacks: {
                addMessage: (text, conversationGuid, userGuid, attachmentUrl, attachmentType, attachmentName) =>
                    this.addMessage(text, userGuid, conversationGuid, attachmentUrl, attachmentType, attachmentName),
            },
        });
    }

    async loadBots() {
        const bots = await this.db.getBots();
        bots.forEach(bot => {
            this.activeBots[bot.token] = this.createBot(bot);
        });
        console.log("Получены боты: \n", this.activeBots);
    }

    async addMessage(text, userGuid, conversationGuid, attachmentUrl = null, attachmentType = null, attachmentName = null) {
        const date = new Date().toISOString();
        return this.db.addMessage(text, conversationGuid, userGuid, 'operator', date, attachmentUrl, attachmentType, attachmentName);
    }

    async eventSendMessage(data) {
        const { text, conversationGuid, attachments } = data;

        const user = await this.mediator.get(this.TRIGGERS.GET_USER_BY_CONVERSATION_GUID, conversationGuid);
        if (!user) return this.answer.bad(503);

        const bot = this.triggerGetBotByUserGuid(user.botGuid);
        if (!bot) return this.answer.bad(405);

        const result = await this.activeBots[bot.token].sendMessage(text, user.externalId, conversationGuid, user.userGuid, attachments);

        if (!result) return this.answer.bad(406);
        return this.answer.good(true);
    }

    triggerGetBotByToken(token) {
        if (this.activeBots[token]) {
            return this.activeBots[token];
        }
        return false;
    }

    triggerGetBotByUserGuid(guid) {
        return Object.values(this.activeBots).find(bot => bot.guid === guid) || null;
    }

    checkOperatorToken(data, socket, eventName) {
        const { operatorGuid: guid, operatorToken: token } = data || {};
        if (!this.mediator.get(this.TRIGGERS.CHECK_OPERATOR_TOKEN, { token, guid, socketId: socket.id })) {
            socket.emit(eventName, this.answer.bad(302));
            return false;
        }
        return true;
    }

    async socketGetBots(data, socket) {
        if (!this.checkOperatorToken(data, socket, 'GET_BOTS')) return;
        try {
            const bots = await this.db.getBots();
            socket.emit('GET_BOTS', this.answer.good(bots));
        } catch (err) {
            socket.emit('GET_BOTS', this.answer.bad(500));
        }
    }

    async socketAddBot(data, socket) {
        if (!this.checkOperatorToken(data, socket, 'ADD_BOT')) return;
        const { token, address, port } = data;
        if (!token || !address || !port) {
            return socket.emit('ADD_BOT', this.answer.bad(242));
        }
        try {
            const guid = this.common.guid();
            await this.db.addBot(guid, token, address, Number(port));

            const botData = { bot_guid: guid, token, address, port: Number(port) };
            this.activeBots[token] = this.createBot(botData);

            socket.emit('ADD_BOT', this.answer.good(botData));
        } catch (err) {
            socket.emit('ADD_BOT', this.answer.bad(500));
        }
    }

    async socketUpdateBot(data, socket) {
        if (!this.checkOperatorToken(data, socket, 'UPDATE_BOT')) return;
        const { guid, token, address, port } = data;
        if (!guid || !token || !address || !port) {
            return socket.emit('UPDATE_BOT', this.answer.bad(242));
        }
        try {
            const oldBot = Object.values(this.activeBots).find(b => b.guid === guid);
            const oldToken = oldBot ? oldBot.token : null;

            await this.db.updateBot(guid, token, address, Number(port));

            if (oldToken && oldToken !== token) {
                delete this.activeBots[oldToken];
            }

            const botData = { bot_guid: guid, token, address, port: Number(port) };
            this.activeBots[token] = this.createBot(botData);

            socket.emit('UPDATE_BOT', this.answer.good(botData));
        } catch (err) {
            socket.emit('UPDATE_BOT', this.answer.bad(500));
        }
    }

    async socketDeleteBot(data, socket) {
        if (!this.checkOperatorToken(data, socket, 'DELETE_BOT')) return;
        const { guid } = data;
        if (!guid) {
            return socket.emit('DELETE_BOT', this.answer.bad(242));
        }
        try {
            const botsCount = Object.keys(this.activeBots).length;
            if (botsCount <= 1) {
                return socket.emit('DELETE_BOT', this.answer.bad(601));
            }

            const bot = Object.values(this.activeBots).find(b => b.guid === guid);
            if (!bot) {
                return socket.emit('DELETE_BOT', this.answer.bad(405));
            }

            await this.db.deleteBot(guid);
            delete this.activeBots[bot.token];

            socket.emit('DELETE_BOT', this.answer.good({ guid }));
        } catch (err) {
            socket.emit('DELETE_BOT', this.answer.bad(500));
        }
    }
}

module.exports = BotManager;