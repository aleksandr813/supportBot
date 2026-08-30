const BaseManager = require('../BaseManager');
const Operator = require('./Operator');

const CONFIG = require('../../../config');

const { LOGIN, LOGOUT } = CONFIG.SOCKET;
const { CHECK_OPERATOR_TOKEN } = CONFIG.MEDIATOR.TRIGGERS;

class OperatorManager extends BaseManager {
    constructor(options) {
        super(options);

        this.operators = {};

        this.mediator.set(CHECK_OPERATOR_TOKEN, (data) => this.triggerCheckOperatorToken(data));

        this.restoreActiveOperators();

        if (!this.io) return;

        this.io.on('connection', (socket) => {
            socket.on(LOGIN, (data) => this.socketLogin(data, socket));
            socket.on(LOGOUT, (data) => this.socketLogout(data, socket));

            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    // Подхватывает операторов, у которых в БД сохранён активный токен (выданный до
    // перезапуска процесса), чтобы браузер, ещё хранящий этот токен, не терял сессию
    // после docker restart / редеплоя сервера.
    async restoreActiveOperators() {
        if (!this.db || !this.db.getActiveOperators) return;
        try {
            const rows = await this.db.getActiveOperators();
            for (const row of rows) {
                const operator = new Operator({ db: this.db, common: this.common, socketId: null });
                operator.name = row.name;
                operator.guid = row.operator_guid;
                operator.token = row.token;
                this.operators[operator.guid] = operator;
            }
        } catch (err) {
            console.error('Failed to restore operator sessions:', err);
        }
    }

    handleDisconnect(socket) {
        const operator = this.getOperatorBySocketId(socket.id);
        if (!operator) {
            return;
        }
        delete this.operators[operator.guid];
    }

    getOperatorBySocketId(socketId) {
        return Object.values(this.operators).find(operator => operator.socketId === socketId) || null;
    }

    async socketLogin(data = {}, socket) {
        const { name, passwordHash } = data;
        if (!name || !passwordHash) {
            return socket.emit(LOGIN, this.answer.bad(242));
        }
        const operator = new Operator({ db: this.db, common: this.common, socketId: socket.id });
        if (await operator.login(name, passwordHash)) {
            this.operators[operator.guid] = operator;
            return socket.emit(LOGIN, this.answer.good(operator.get()));
        }
        return socket.emit(LOGIN, this.answer.bad(301));
    }

    socketLogout(data, socket) {
        const { operatorToken: token } = data;
        const operator = this.getOperatorBySocketId(socket.id);
        if (operator && operator.token === token) {
            operator.logout();
        }
    }

    triggerCheckOperatorToken({ token, guid, socketId }) {
        const operator = this.operators[guid];
        if (!operator || operator.token !== token) return false;
        if (socketId) operator.socketId = socketId;
        return true;
    }
}

module.exports = OperatorManager;