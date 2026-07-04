class Operator {
    constructor({ db, common, socketId }) {
        this.db = db;
        this.common = common;
        this.socketId = socketId;

        this.guid;
        this.name;
    }

    async login(name, _passwordHash) {
        const data = await this.db.getOperatorByLogin(name);
        const { guid: operator_guid, passwordHash: password_hash } = data;
        if (_passwordHash === passwordHash) {
            this.name = name;
            this.guid = guid;
            return true;
        }
        return false;
    }

    get() {
        return {
            name: this.name,
            guid: this.guid,
            socketId: this.socketId,
        }
    }
}

module.exports = Operator;