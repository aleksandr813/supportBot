const BaseManager = require('../BaseManager');

const CONFIG = require('../../../config');

const { GET_CONVERSATIONS } = CONFIG.SOCKET;

class ConversationManager extends BaseManager {
    constructor(options) {
        super(options);

        this.activeConversations = {};

        this.mediator.subscribe(this.EVENTS.END_CONVERSATION, (data) => this.eventEndConversation(data));
        this.mediator.subscribe(this.EVENTS.CREATE_CONVERSATION, (data) => this.eventCreateConversation(data));
        this.mediator.subscribe(this.EVENTS.NEW_MESSAGE, (data) => this.eventNewMessage(data));

        if (!this.io) return;
        this.io.on('connection', (socket) => {
            socket.on(GET_CONVERSATIONS, (data) => this.socketGetConversationsList(data, socket));
        });
    }

    //EVENTS
    async eventNewMessage(message = {}) {
        const { token, externalId, text } = message;
        const date = new Date().toISOString();

        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT, token).guid;

        const user = await this.mediator.get(this.TRIGGERS.GET_USER, {externalId, botGuid});
        //console.log(user);
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

    //SOCKET
    async socketGetConversationsList(data, socket) {
        const { limit = 20, cursor = null } = data;

        const rows = await this.db.getConversationsList(limit + 1, cursor );

        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;

        const lastItem = items[items.length - 1];
        const nextCursor = hasMore && lastItem
            ? { lastDate: lastItem.last_date, conversationGuid: lastItem.conversation_guid }
            : null;

        const conversatons ={
            items,
            nextCursor,
            hasMore,
        };

        socket.emit(GET_CONVERSATIONS, this.answer.good(conversatons));
    }
}

module.exports = ConversationManager;
