const BaseManager = require('../BaseManager');

class ConversationManager extends BaseManager {
    constructor(options) {
        super(options);

        this.activeConversations = {};

        this.mediator.subscribe(this.EVENTS.END_CONVERSATION, (data) => this.eventEndConversation(data));
        this.mediator.subscribe(this.EVENTS.CREATE_CONVERSATION, (data) => this.eventCreateConversation(data));
        this.mediator.subscribe(this.EVENTS.NEW_MESSAGE, (data) => this.eventNewMessage(data));
    }

    //EVENTS
    async eventNewMessage(message = {}) {
        const { token, externalId, text } = message;
        const date = new Date().toISOString();

        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT, token).guid;

        const user = await this.mediator.get(this.TRIGGERS.GET_USER, {externalId, botGuid});
        console.log(user);
        if (!user) return this.answer.bad(503);
        if (!user.currentConversation) return this.answer.bad(504);

        await this.db.addMessage(text, user.currentConversation, user.userGuid , date);

        return this.answer.good(true);
    }

    async eventCreateConversation(data) {
        const { token, externalId, role } = data;
        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT, token).guid;
        const conversationGuid = this.common.guid();
        const date = new Date().toISOString();

        const user = await this.mediator.get(this.TRIGGERS.GET_USER, {externalId, botGuid});
        if (!user) return this.answer.bad(503);
        if (user.currentConversation) return this.answer.bad(502);

        this.mediator.call(this.EVENTS.SET_USER_CONVERSATION, {externalId, botGuid, newConversationGuid: conversationGuid});
        this.db.createConversation(conversationGuid, botGuid, externalId, role, date);

        return this.answer.good(true);
    }

    async eventEndConversation(data) {
        const { token, externalId } = data;
        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT, token).guid;

        const user = await this.mediator.get(this.TRIGGERS.GET_USER, {externalId, botGuid});
        if (!user) return this.answer.bad(503);

        if (!user.currentConversation) return this.answer.bad(504);

        this.mediator.call(this.EVENTS.SET_USER_CONVERSATION, {externalId, botGuid, newConversationGuid: ''});

        return this.answer.good(true);
    }
}

module.exports = ConversationManager;
