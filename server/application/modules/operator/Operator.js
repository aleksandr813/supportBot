class Operator {
    constructor({ db, common, socketId }) {
        this.db = db;
        this.common = common;
        this.socketId = socketId;

        this.guid;
        this.name;
        this.token;
    }

    async login(name, passwordHash) {
        const data = await this.db.getOperatorByLogin(name);
        if (!data) return false;
        const { guid, password_hash } = data;
        if (passwordHash === password_hash) {
            this.name = name;
            this.guid = guid;
            this.token = this.common.token();
            return true;
        }
        return false;
    }

    get() {
        return {
            name: this.name,
            guid: this.guid,
            token: this.token,
            socketId: this.socketId,
        }
    }
}

module.exports = Operator;