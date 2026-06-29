const BaseManager = require('../BaseManager');
const User = require('./User');


class UserManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeUsers = {};

        this.mediator.set(this.TRIGGERS.GET_USER, (user) => this.triggerGetUser(user));
    }

    createUser(user) {
        const { externalId, botId, username } = user;
        this.db.createUser(externalId, botId, username);
        const _user = new User({ externalId, botId, username });
        this.activeUsers[`${externalId};${botId}`] = _user;
        return _user;
    }

    loadUser(userData) {
        const { external_id: externalId, bot_id: botId, username } = userData;
        const _user = new User({ externalId, botId, username });
        this.activeUsers[`${externalId};${botId}`] = _user;
        return _user;
    }

    //TRIGGERS
    async triggerGetUser(user) {
        const { externalId, botId } = user;
        const key = `${externalId};${botId}`;
        if (this.activeUsers[key]) return this.activeUsers[key];
        const userData = await this.db.getUser(externalId, botId);
        if (userData) return this.loadUser(userData);
        return this.createUser(user);
    }
}

module.exports = UserManager;
