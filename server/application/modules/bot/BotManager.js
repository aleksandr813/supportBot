const CONFIG = require('../../../config');

class BotManager {
    constructor(options) {
        const { mediator } = options;

        this.mediator = mediator;

        this.EVENTS = this.mediator.getEventTypes();
        this.TRIGGERS = this.mediator.getTriggerTypes();
    }

    eventNewMessage(message = {}) {
        
    }
}