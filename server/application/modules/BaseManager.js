const CONFIG = require('../../config');

class BaseManager {
    constructor(options) {
        const { mediator, db, answer } = options;

        this.answer = answer;
        this.mediator = mediator;
        this.db = db;

        this.EVENTS = this.mediator.getEventTypes();
        this.TRIGGERS = this.mediator.getTriggerTypes();
    }
}

module.exports = BaseManager;