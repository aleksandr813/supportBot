const BaseManager = require('../BaseManager');
const CONFIG = require('../../../config');

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

    }
}

module.exports