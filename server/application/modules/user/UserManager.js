const BaseManager = require('../BaseManager');
const User = require('./User');


class UserManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeUsers = {};

        this.mediator.subscribe(this.EVENTS.ADD_USER, (user) => this.eventCreateUser(user));
        this.mediator.set(this.TRIGGERS.GET_USER, (user) => this.triggerGetUser(user));
    }

    
    loadUser(userData) {
        const { external_id: externalId, bot_id: botId, username } = userData;
        const _user = new User({ externalId, botId, username });
        this.activeUsers[`${externalId};${botId}`] = _user;
        return _user;
    }
    
    //EVENTS
    eventCreateUser(user) {
        const { token, externalId, username, phone } = user;
        const bot = this.mediator.get(this.TRIGGERS.GET_BOT, token)
        this.db.createUser(externalId, botId, username);
        const _user = new User({ externalId, botId, username });
        this.activeUsers[`${externalId};${botId}`] = _user;
        return _user;
    }

    //TRIGGERS
    async triggerGetUser(externalId, botId) {
        const key = `${externalId};${botId}`;
        if (this.activeUsers[key]) return this.activeUsers[key];
        const userData = await this.db.getUser(externalId, botId);
        if (userData) return this.loadUser(userData);
        return this.createUser(user);
    }
}

module.exports = UserManager;
