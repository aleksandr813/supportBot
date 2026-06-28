const CONFIG = require('../../../config');
const BaseManager = require('../BaseManager');

class BotManager extends BaseManager {
    constructor(options) {
        super(options)

        this.mediator.subscribe(this.EVENTS.NEW_MESSAGE, (data) => this.eventNewMessage(data));
    }

    checkMessageValues(message) {
        if (typeof(message.token) != 'string' ||
            typeof(message.role) != 'string' ||
            typeof(message.conversationId) != 'number' ||
            typeof(message.username) != 'string' ||
            typeof(message.userId) != 'string' ||
            typeof(message.text) != 'string'
        ) return false;
        if (message.text.length() == 0) return false;
        return true;
    }

    //EVENTS
    eventNewMessage(message = {}) {
        if (!this.checkMessageValues(message)) {
            return this.answer.bad(242);
        }


    }
}

module.exports = BotManager;