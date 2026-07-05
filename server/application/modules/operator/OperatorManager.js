const BaseManager = require('../BaseManager');
const Operator = require('./Operator');

const CONFIG = require('../../../config');

const { LOGIN } = CONFIG.SOCKET;

class OperatorManager extends BaseManager {
    constructor(options) {
        super(options);

        this.operators = {};

        if (!this.io) return;

        this.io.on('connection', (socket) => {
            socket.on(LOGIN, (data) => this.socketLogin(data, socket));

            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    handleDisconnect(socket) {
        console.log(socket.id);
        const operator = this.getOperatorBySocketId(socket.id);
        if (!operator) {
            //console.log('Оператор с таким socketId не найден');
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
}

module.exports = OperatorManager;