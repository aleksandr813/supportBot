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
                callbacks: (data) => this.addMessage(data),
             }); 
        });
        console.log("Получены боты: \n", this.activeBots);
    }

    addMessage(text, userGuid, conversationGuid) {

        const date = new Date().toISOString();

        this.db.addMessage(text, conversationGuid, 'operator', date);
    }
    
    //EVENTS
    
    async eventSendMessage(text, conversationGuid) {
        const bot = this.triggerGetBotByUserGuid(userGuid);
        if (!bot) return this.answer.bad(405);

        const user = await this.db.getUserByConversationGuid(conversationGuid);
        const result = await this.activeBots[bot.token].sendMessage(text, user.external_id, conversationGuid, user.user_guid);

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
