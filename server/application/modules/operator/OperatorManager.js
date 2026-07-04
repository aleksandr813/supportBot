const BaseManager = require('../BaseManager');

class OperatorManager extends BaseManager {
    constructor(options) {
        super(options);

        this.operators = {};

        if (!this.io) return;
        this.io.on('connection', (socket) => {
            //socket.on(MESSAGE, (data) => this.sendMessage(data, socket));
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }
}

module.exports