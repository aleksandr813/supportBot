const argon2 = require('argon2');
const crypto = require('crypto');

class Common { 

    guid() {
        return crypto.randomUUID();
    }

    token() {
        return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    }

    async hashPassword(password) {
        return await argon2.hash(password);
    }

    async  checkPassword(password, hash) {
        return await argon2.verify(hash, password);
    }
}

module.exports = Common;