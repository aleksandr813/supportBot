const express = require('express');
const { Bot } = require('@maxhub/max-bot-api');
const CONFIG = require('./config');
const Server = require('./services/Server');
const createHandlers = require('./handlers');
const Router = require('./router/Router');
const Answer = require('./answer');

const server = new Server(CONFIG.HOST);

const answer = new Answer();

const {
    handleStart,
    handleContact,
    handleRoleSelection,
    handleClose,
    handleUserMessage,
} = createHandlers(server);

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

const app = express();
app.use(express.json());
app.use('/', Router(bot, answer));

const { PORT } = CONFIG;

app.listen(PORT, () => console.log(`Bot HTTP server started at PORT ${PORT}`));