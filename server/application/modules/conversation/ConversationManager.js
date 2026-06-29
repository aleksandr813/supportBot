const CONFIG = require('../../../config');
const BaseManager = require('../BaseManager');

class ConversationManager extends BaseManager {
    constructor(options) {
        super(options)

        this.activeBots = this.loadBots();

        this.mediator.subscribe(this.EVENTS.NEW_MESSAGE, (data) => this.eventNewMessage(data));
    }

    
    loadBots() {
        const bots = Object.fromEntries(this.db.getBots().map(
            bot => [bot.token, bot]
        ));
        console.log("Получены боты: \n", bots);
        return bots;
    }
    
    getBotByToken(token) {
        if (this.activeBots[token]) {
            return this.activeBots[token];
        }
        return false;
    }


    checkMessageValues(message) {
        if (typeof(message.token) != 'string' ||
            typeof(message.role) != 'string' ||
            typeof(message.conversationGuid) != 'number' ||
            typeof(message.username) != 'string' ||
            typeof(message.externalId) != 'string' ||
            typeof(message.text) != 'string'
        ) return false;
        if (message.text.length() == 0) return false;
        if (!message.conversationGuid) return false;
        return true;
    }

    //EVENTS
    eventNewMessage(message = {}) {
        if (message && !this.checkMessageValues(message)) {
            return this.answer.bad(242);
        }

        const {
            token,
            role,
            conversationGuid, 
            username,
            externalId,
            text,
            date,
        } = message;
        this.db.addMessage()
    }
}

module.exports = ConversationManager;