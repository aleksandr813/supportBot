const BaseManager = require('../BaseManager');

const CONFIG = require('../../../config');

const { GET_CONVERSATIONS, GET_CONVERSATION_INFO, GET_CONVERSATION_MESSAGES, SEND_MESSAGE } = CONFIG.SOCKET;

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
            socket.on(GET_CONVERSATION_INFO, (data) => this.socketGetConversationInfo(data, socket));
            socket.on(GET_CONVERSATION_MESSAGES, (data) => this.socketGetConversationMessages(data, socket));
            socket.on(SEND_MESSAGE, (data) => this.socketSendMessage(data, socket));
        });
    }

    checkOperatorToken(data, socket) {
        const { token, guid } = data;
        if (!this.mediator.get(this.TRIGGERS.CHECK_OPERATOR_TOKEN, { token, guid })) {
            socket.emit(this.answer.bad(302));
            return false;
        }
        return true;
    }

    //EVENTS
    async eventNewMessage(message = {}) {
        const { token, externalId, text } = message;
        const date = new Date().toISOString();

        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT_BY_TOKEN, token).guid;

        const user = await this.mediator.get(this.TRIGGERS.GET_USER, {externalId, botGuid});
        //console.log(user);
        if (!user) return this.answer.bad(503);
        if (!user.currentConversation) return this.answer.bad(504);

        await this.db.addMessage(text, user.currentConversation, user.userGuid , date);

        return this.answer.good(true);
    }

    async eventCreateConversation(data) {
        const { token, externalId, role } = data;
        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT_BY_TOKEN, token).guid;
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
        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT_BY_TOKEN, token).guid;

        const user = await this.mediator.get(this.TRIGGERS.GET_USER, {externalId, botGuid});
        if (!user) return this.answer.bad(503);

        if (!user.currentConversation) return this.answer.bad(504);

        this.mediator.call(this.EVENTS.SET_USER_CONVERSATION, {externalId, botGuid, newConversationGuid: ''});

        return this.answer.good(true);
    }

    //SOCKET
    async socketGetConversationsList(data, socket) {

        if (!this.checkOperatorToken(data, socket)) return;

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

    async socketGetConversationInfo(data, socket) {

        if (!this.checkOperatorToken(data, socket)) return;

        const { conversationGuid } = data;

        const conversationInfo = await this.db.getConversationInfo(conversationGuid);

        socket.emit(GET_CONVERSATION_INFO, this.answer.good(conversationInfo[0]));
    }

    async socketGetConversationMessages(data, socket) {

        if (!this.checkOperatorToken(data, socket)) return;

        const { conversationGuid, limit = 20, cursor = null } = data;

        const rows = await this.db.getConversationMessages(conversationGuid, { limit: limit + 1, cursor });

        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;

        const lastItem = items[items.length - 1];
        let nextCursor;

        if (hasMore && lastItem) {
            nextCursor = lastItem.message_id;
        } else {
            nextCursor = null;
        }

        socket.emit(GET_CONVERSATION_MESSAGES, this.answer.good({
            conversationGuid,
            items,
            nextCursor,
            hasMore,
        }));
    }

    async socketSendMessage(data, socket) {
        if (!this.checkOperatorToken(data, socket)) return;

        const result = await this.mediator.call(this.EVENTS.SEND_MESSAGE, data);
        socket.emit(SEND_MESSAGE, result);
    }
}

module.exports = ConversationManager;