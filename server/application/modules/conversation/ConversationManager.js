const BaseManager = require('../BaseManager');

class ConversationManager extends BaseManager {
    constructor(options) {
        super(options);

        this.activeConversations = {};

        this.mediator.subscribe(this.EVENTS.NEW_MESSAGE, (data) => this.eventNewMessage(data));
    }

    checkMessageValues(message) {
        if (typeof(message.token) != 'string' ||
            typeof(message.role) != 'string' ||
            typeof(message.conversationGuid) != 'string' ||
            typeof(message.externalId) != 'string' ||
            typeof(message.text) != 'string'
        ) return false;
        if (message.text.length == 0) return false;
        if (!message.conversationGuid) return false;
        return true;
    }

    async getConversation({ conversationGuid, botGuid, role }) {
        if (this.activeConversations[conversationGuid]) return this.activeConversations[conversationGuid];
        const convData = await this.db.getConversation(conversationGuid, botGuid);
        if (convData) {
            this.activeConversations[conversationGuid] = convData;
            return convData;
        }
        await this.db.createConversation(conversationGuid, botGuid, role);
        const conversation = { conversation_guid: conversationGuid, bot_guid: botGuid, role };
        this.activeConversations[conversationGuid] = conversation;
        return conversation;
    }

    //EVENTS
    async eventNewMessage(message = {}) {
        if (!this.checkMessageValues(message)) {
            return this.answer.bad(242);
        }

        const { token, role, conversationGuid, username, externalId, text } = message;
        const date = message.date || new Date().toISOString();

        const bot = this.mediator.get(this.TRIGGERS.GET_BOT, token);
        if (!bot) {
            return this.answer.bad(403);
        }

        const botGuid = bot.bot_guid;

        await this.mediator.get(this.TRIGGERS.GET_USER, { externalId, botGuid, username });

        await this.getConversation({ conversationGuid, botGuid, role });

        await this.db.addMessage(text, conversationGuid, 0, date);

        return this.answer.good(true);
    }
}

module.exports = ConversationManager;
