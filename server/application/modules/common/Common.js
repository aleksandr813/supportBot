const crypto = require('crypto');

class Common {

    guid() {
        return crypto.randomUUID();
    }

    token() {
        return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    }
}

module.exports = Common;