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
        const { external_id: externalId, bot_guid: botGuid, username } = userData;
        const _user = new User({ externalId, botGuid, username });
        this.activeUsers[`${externalId};${botGuid}`] = _user;
        return _user;
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
        const _user = new User({ externalId, botGuid, username });
        this.activeUsers[`${externalId};${botGuid}`] = _user;
        return this.answer.good(true);
    }

    //TRIGGERS
    async triggerGetUser(externalId, botGuid) {
        const key = `${externalId};${botGuid}`;
        if (this.activeUsers[key]) return this.activeUsers[key];
        const userData = await this.db.getUser(externalId, botGuid);
        if (userData) return this.loadUser(userData);
        return this.createUser(user);
    }
}

module.exports = UserManager;
