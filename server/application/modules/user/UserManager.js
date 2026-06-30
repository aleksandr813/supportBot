const BaseManager = require('../BaseManager');
const User = require('./User');


class UserManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeUsers = {};

        this.mediator.subscribe(this.EVENTS.SET_USER_CONVERSATION, (data) => this.eventSetUserConversation(data));
        this.mediator.subscribe(this.EVENTS.ADD_USER, (user) => this.eventCreateUser(user));
        this.mediator.set(this.TRIGGERS.GET_USER, (user) => this.triggerGetUser(user));
    }

    addUser(externalId, botGuid, username, currentConversation = '') { //ТОЛЬКО для активных записей
        const _user = new User({ externalId, botGuid, username, currentConversation,
            callbacks: {
                setUserConversation: (externalId, botGuid, newConversationGuid) => this.db.setUserConversation(externalId, botGuid, newConversationGuid),
            }
        });
        this.activeUsers[`${externalId};${botGuid}`] = _user;
        return _user;
    }

    
    loadUser(userData) {
        console.log(userData);
        const { 
            external_id: externalId, 
            bot_guid: botGuid, 
            username: username, 
            current_conversation: currentConversation } = userData;
        return this.addUser(externalId, botGuid, username, currentConversation);
    }
    
    async isUserAlreadyExist(externalId, botGuid) {
        const key = `${externalId};${botGuid}`;
        if (this.activeUsers[key]) return this.activeUsers[key];
        const userData = await this.db.getUser(externalId, botGuid);
        if (userData) return this.loadUser(userData);
        return false;
    }

    //EVENTS
    async eventCreateUser(user) {
        const { token, externalId, username, phone } = user;
        const botGuid = this.mediator.get(this.TRIGGERS.GET_BOT, token).guid;
        const userGuid = this.common.guid();
        if (await this.isUserAlreadyExist(externalId, botGuid)) return this.answer.bad(501);
        this.db.createUser(userGuid, externalId, botGuid, username);
        this.addUser(externalId, botGuid, username);
        return this.answer.good(true);
    }

    async eventSetUserConversation({ externalId, botGuid, newConversationGuid} ) {
        const user = await this.triggerGetUser({ externalId, botGuid} );
        if (!user) return this.answer.bad(503);
        
        const key = `${externalId};${botGuid}`;
        //console.log(this.activeUsers[key]);
        this.activeUsers[key].setConversation(newConversationGuid);
    }

    //TRIGGERS
    async triggerGetUser({ externalId, botGuid} ) {
        const key = `${externalId};${botGuid}`;
        if (this.activeUsers[key]) return this.activeUsers[key].get();
        const userData = await this.db.getUser(externalId, botGuid);
        if (userData) return this.loadUser(userData).get();
        return false;
    }
}

module.exports = UserManager;
