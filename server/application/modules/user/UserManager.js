const CONFIG = require('../../../config');
const BaseManager = require('../BaseManager');
const User = require('./User');


class UserManager extends BaseManager {
    constructor() {
        this.users = {}
    }

    getUser(user) {
        const {externalId, botId} = user;
        if (this.users[`${externalId};${botId}`]) {
            return this.users[`${externalId};${botId}`].get();
        }
        else {
            _user = this.db.getUser(externalId, botId)
            if (_user) {
                return this.loadUser(_user);
            }
            else {
                return this.createUser(user);
            }
        }
    }

    createUser(user) {
        this.db.createUser(user);
        this.users[`${externalId};${botId}`] = user;
        return user;
    }

    loadUser(user) {
        const _user = new User(user);
        this.users[`${externalId};${botId}`] = _user;
        return _user;
    }
}

module.exports = UserManager;