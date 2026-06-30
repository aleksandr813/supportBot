const BaseManager = require('../BaseManager');
const Bot = require('./Bot');


class UserManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeBots = {};
        this.loadBots();

        this.mediator.set(this.TRIGGERS.GET_BOT, (data) => this.triggerGetBotByToken(data));
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
}

module.exports = UserManager;
