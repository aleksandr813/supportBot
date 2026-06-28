const CONFIG = require('../../../config');
const BaseManager = require('../BaseManager');
const User = require('./User');


class UserManager extends BaseManager {
    constructor() {
        this.users = {}
    }

    getUser(user) {
        const {userId, botId} = user;
        if (this.users[`${userId};${botId}`]) {
            return this.users[`${userId};${botId}`].get();
        }
        else {
            _user = this.db.getUser(userId, botId)
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
        this.users[`${userId};${botId}`] = user;
        return user;
    }

    loadUser(user) {
        const _user = new User(user);
        this.users[`${userId};${botId}`] = _user;
        return _user;
    }
}

module.exports = UserManager;