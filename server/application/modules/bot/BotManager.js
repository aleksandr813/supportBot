const BaseManager = require('../BaseManager');
const Bot = require('./Bot');


class UserManager extends BaseManager {
    constructor(options) {
        super(options);
        this.activeBots = {};
        this.loadBots();

        this.mediator.subscribe(this.EVENTS.SEND_MESSAGE, (data) => this.eventSendMessage(data));

        this.mediator.set(this.TRIGGERS.GET_BOT_BY_TOKEN, (data) => this.triggerGetBotByToken(data));
        this.mediator.set(this.TRIGGERS.GET_BOT_BY_USER_GUID, (data) => this.triggerGetBotByUserGuid(data));
    }

    
    async loadBots() {
        const bots = await this.db.getBots();
        bots.forEach(bot => { 
            this.activeBots[bot.token] = new Bot({ ...bot, 
                callbacks: {
                    addMessage: (text, conversationGuid, userGuid) => this.addMessage(text, userGuid, conversationGuid),
                },
             }); 
        });
        console.log("Получены боты: \n", this.activeBots);
    }

    addMessage(text, userGuid, conversationGuid) {
        const date = new Date().toISOString();
        this.db.addMessage(text, conversationGuid, userGuid, 'operator', date);
    }
    
    //EVENTS
    
    async eventSendMessage(data) {
        const { text, conversationGuid } = data;

        const user = await this.mediator.get(this.TRIGGERS.GET_USER_BY_CONVERSATION_GUID, conversationGuid);
        if (!user) return this.answer.bad(503);

        const bot = this.triggerGetBotByUserGuid(user.botGuid);
        if (!bot) return this.answer.bad(405);

        const result = await this.activeBots[bot.token].sendMessage(text, user.externalId, conversationGuid, user.userGuid);

        if (!result) return this.answer.bad(406);
        return this.answer.good(true);
    }

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
