const BaseManager = require('../BaseManager');
const Operator = require('./Operator');

const CONFIG = require('../../../config');

const { LOGIN } = CONFIG.SOCKET;

class OperatorManager extends BaseManager {
    constructor(options) {
        super(options);

        this.operators = {};

        if (!this.io) return;

        const { SOCKET } = CONFIG;

        this.io.on('connection', (socket) => {
            socket.on(SOCKET.LOGIN, (data) => this.socketLogin(data, socket));

            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    socketLogin(data = {}, socket) {
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
}

module.exports