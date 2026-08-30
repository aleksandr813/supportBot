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
        const { operator_guid, password_hash } = data;
        if (passwordHash === password_hash) {
            this.name = name;
            this.guid = operator_guid;
            this.token = this.common.token();
            // Персистим токен в БД, чтобы сессия оператора переживала перезапуск сервера
            // (docker restart/redeploy) и не терялась, пока браузер не перезагрузит страницу.
            if (this.db.setOperatorToken) {
                await this.db.setOperatorToken(this.guid, this.token);
            }
            return true;
        }
        return false;
    }

    logout() {
        this.token = '';
        if (this.guid && this.db.setOperatorToken) {
            this.db.setOperatorToken(this.guid, '').catch(err => console.error('Failed to clear operator token:', err));
        }
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