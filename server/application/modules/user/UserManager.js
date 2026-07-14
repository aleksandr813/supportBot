const BaseManager = require('../BaseManager');
const User = require('./User');


class UserManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeUsers = {};

        this.mediator.subscribe(this.EVENTS.SET_USER_CONVERSATION, (data) => this.eventSetUserConversation(data));
        this.mediator.subscribe(this.EVENTS.ADD_USER, (user) => this.eventCreateUser(user));
        this.mediator.set(this.TRIGGERS.GET_USER, (user) => this.triggerGetUser(user));
        this.mediator.set(this.TRIGGERS.GET_USER_BY_CONVERSATION_GUID, (data) => this.triggerGetUserByConversationGuid(data));

        if (this.io) {
            this.io.on('connection', (socket) => {
                socket.on('GET_BLOCKED_USERS', (data) => this.socketGetBlockedUsers(data, socket));
                socket.on('BLOCK_USER', (data) => this.socketBlockUser(data, socket));
            });
        }
    }

    addUser(externalId, userGuid, botGuid, username, currentConversation = '', phone = '', isBlocked = 0) {
        const _user = new User({ externalId, userGuid, botGuid, username, currentConversation, phone, isBlocked,
            callbacks: {
                setUserConversation: (externalId, botGuid, newConversationGuid) => this.db.setUserConversation(externalId, botGuid, newConversationGuid),
            }
        });
        this.activeUsers[`${externalId};${botGuid}`] = _user;
        return _user;
    }

    
    loadUser(userData) {
        const { 
            external_id: externalId, 
            user_guid: userGuid,
            bot_guid: botGuid, 
            username: username, 
            current_conversation: currentConversation,
            phone: phone,
            is_blocked: isBlocked } = userData;
        return this.addUser(externalId, userGuid, botGuid, username, currentConversation, phone, isBlocked);
    }
    
    async isUserAlreadyExist(externalId, botGuid) {
        const key = `${externalId};${botGuid}`;
        if (this.activeUsers[key]) return this.activeUsers[key];
        const userData = await this.db.getUser(externalId, botGuid);
        if (userData) return this.loadUser(userData);
        return false;
    }

    async eventCreateUser(user) {
        const { token, externalId, username, phone } = user;
        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT_BY_TOKEN, token).guid;
        const userGuid = this.common.guid();
        if (await this.isUserAlreadyExist(externalId, botGuid)) return this.answer.bad(501);
        this.db.createUser(userGuid, externalId, botGuid, username, phone);
        this.addUser(externalId, userGuid, botGuid, username, '', phone);
        return this.answer.good(true);
    }

    async eventSetUserConversation({ externalId, botGuid, newConversationGuid} ) {
        const user = await this.triggerGetUser({ externalId, botGuid} );
        if (!user) return this.answer.bad(503);
        
        const key = `${externalId};${botGuid}`;
        this.activeUsers[key].setConversation(newConversationGuid);
    }

    async triggerGetUser({ externalId, botGuid} ) {
        const key = `${externalId};${botGuid}`;
        if (this.activeUsers[key]) return this.activeUsers[key].get();
        const userData = await this.db.getUser(externalId, botGuid);
        if (userData) return this.loadUser(userData).get();
        return false;
    }

    async triggerGetUserByConversationGuid(conversationGuid) {
        const activeUser = Object.values(this.activeUsers).find(user => user.currentConversation === conversationGuid);
        if (activeUser) return activeUser.get();

        const rawUser = await this.db.getUserByConversationGuid(conversationGuid);
        if (!rawUser) return null;

        return this.triggerGetUser({ externalId: rawUser.external_id, botGuid: rawUser.bot_guid });
    }

    checkOperatorToken(data, socket, eventName) {
        const { token, guid } = data || {};
        if (!this.mediator.get(this.TRIGGERS.CHECK_OPERATOR_TOKEN, { token, guid })) {
            socket.emit(eventName, this.answer.bad(302));
            return false;
        }
        return true;
    }

    async socketGetBlockedUsers(data, socket) {
        if (!this.checkOperatorToken(data, socket, 'GET_BLOCKED_USERS')) return;
        try {
            const rawUsers = await this.db.getBlockedUsers();
            const items = rawUsers.map(u => ({
                userGuid: u.user_guid,
                externalId: u.external_id,
                username: u.username,
                botGuid: u.bot_guid,
                phone: u.phone,
                isBlocked: u.is_blocked
            }));
            socket.emit('GET_BLOCKED_USERS', this.answer.good(items));
        } catch (err) {
            socket.emit('GET_BLOCKED_USERS', this.answer.bad(500));
        }
    }

    async socketBlockUser(data, socket) {
        if (!this.checkOperatorToken(data, socket, 'BLOCK_USER')) return;
        const { externalId, botGuid, isBlocked } = data;
        if (!externalId || !botGuid) {
            return socket.emit('BLOCK_USER', this.answer.bad(242));
        }

        try {
            await this.db.setUserBlockStatus(externalId, botGuid, isBlocked ? 1 : 0);

            const key = `${externalId};${botGuid}`;
            if (this.activeUsers[key]) {
                this.activeUsers[key].isBlocked = isBlocked ? 1 : 0;
            }

            socket.emit('BLOCK_USER', this.answer.good({ externalId, botGuid, isBlocked }));
        } catch (err) {
            socket.emit('BLOCK_USER', this.answer.bad(500));
        }
    }
}

module.exports = UserManager;
