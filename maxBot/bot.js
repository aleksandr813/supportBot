const { Bot } = require('@maxhub/max-bot-api');
const CONFIG = require('./config');
const {
    handleStart,
    handleContact,
    handleRoleSelection,
    handleClose,
    handleUserMessage,
} = require('./handlers');

const bot = new Bot(CONFIG.BOT_TOKEN);

bot.api.setMyCommands([
    { name: 'start', description: 'Начать обращение' },
    { name: 'close', description: 'Закрыть обращение' },
]);

bot.command('start', handleStart);
bot.command('close', handleClose);
bot.on('bot_started', handleStart);
bot.action(/^role:(.+)/, handleRoleSelection);

bot.on('message_created', async (ctx) => {
    if (ctx.contactInfo) {
        return handleContact(ctx);
    }

    const text = ctx.message?.body?.text?.trim();
    if (!text || text.startsWith('/')) {
        return;
    }

    return handleUserMessage(ctx);
});

bot.start();