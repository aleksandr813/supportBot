const argon2 = require('argon2');

class Common { 

    guid() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
    }

    async hashPassword(password) {
    return await argon2.hash(password);
    }

    async  checkPassword(password, hash) {
    return await argon2.verify(hash, password);
    }
}

module.exports = Common;