const CONFIG = require('../../../config');

class BotManager {
    constructor(options) {
        const { mediator, db, answer } = options;

        this.answer = answer;
        this.mediator = mediator;
        this.db = db;

        this.EVENTS = this.mediator.getEventTypes();
        this.TRIGGERS = this.mediator.getTriggerTypes();

        this.mediator.subscribe(this.EVENTS.NEW_MESSAGE, (data) => this.eventNewMessage(data));
    }

    checkMessageValues(message) {
        if (typeof(message.token) != 'string' ||
            typeof(message.role) != 'string' ||
            typeof(message.conversation_id) != 'number' ||
            typeof(message.username) != 'string' ||
            typeof(message.user_id) != 'string' ||
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