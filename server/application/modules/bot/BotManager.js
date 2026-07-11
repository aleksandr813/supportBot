const BaseManager = require('../BaseManager');
const Bot = require('./Bot');


class UserManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeBots = {};
        this.loadBots();

        this.mediator.set(this.TRIGGERS.GET_BOT_BY_TOKEN, (data) => this.triggerGetBotByToken(data));
        this.mediator.set(this.TRIGGERS.GET_BOT_BY_USER_GUID, (data) => this.triggerGetBotByUserGuid(data));
    }

    
    async loadBots() {
        const bots = await this.db.getBots();
        bots.forEach(bot => { 
            this.activeBots[bot.token] = new Bot(bot); 
        });
        console.log("Получены боты: \n", this.activeBots);
    }
    
    //EVENTS
    //...

    //TRIGGERS
    triggerGetBotByToken(token) {
        if (this.activeBots[token]) {
            return this.activeBots[token];
        }
        return false;
    }

    triggerGetBotByUserGuid(guid) {
        return Object.values(this.activeBots).find(bot => bot.guid === guid) || null;
    }
}

module.exports = UserManager;
