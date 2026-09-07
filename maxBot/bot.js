const express = require('express');
const { Bot } = require('@maxhub/max-bot-api');
const CONFIG = require('./config');
const Server = require('./services/Server');
const createHandlers = require('./handlers');
const Router = require('./router/Router');
const Answer = require('./answer');

const POLLING_RETRY_DELAY_MS = 5_000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startPollingWithRecovery() {
    while (true) {
        try {
            await bot.start();
        } catch (error) {
            console.error('[maxBot] MAX bot polling failed, will retry:', error);
        }
        bot.stop();
        await sleep(POLLING_RETRY_DELAY_MS);
    }
}

const bot = new Bot(CONFIG.BOT_TOKEN);

const originalGetStreamFromSource = bot.api.upload.getStreamFromSource;
bot.api.upload.getStreamFromSource = async (source) => {
    if (source && source.buffer && source.fileName) {
        return {
            buffer: source.buffer,
            fileName: source.fileName,
        };
    }
    return originalGetStreamFromSource(source);
};
const server = new Server(CONFIG.HOST);

const answer = new Answer();

const {
    handleStart,
    handleContact,
    handleRoleSelection,
    handleClose,
    handleUserMessage,
} = createHandlers(server, bot);

bot.api.setMyCommands([
    { name: 'start', description: 'Начать обращение' },
    { name: 'close', description: 'Закрыть обращение' },
]).catch(error => {
    console.error('Failed to register bot commands with MAX:', error);
});

bot.command('start', handleStart);
bot.command('close', handleClose);
bot.on('bot_started', handleStart);
bot.action(/^role:(.+)/, handleRoleSelection);

bot.on('message_created', async (ctx) => {
    if (ctx.contactInfo) {
        return handleContact(ctx);
    }

    //console.log("INCOMING MESSAGE:", JSON.stringify(ctx.message, null, 2));

    const text = ctx.message?.body?.text?.trim() || '';
    const attachments = ctx.message?.body?.attachments || [];
    const hasAttachments = attachments && attachments.length > 0;

    if (text.startsWith('/')) {
        return;
    }

    if (!text && !hasAttachments) {
        return;
    }

    return handleUserMessage(ctx);
});

startPollingWithRecovery();

const app = express();
app.use(express.json());
app.use('/', Router(bot, answer));

const { PORT } = CONFIG;

app.listen(PORT, () => console.log(`Bot HTTP server started at PORT ${PORT}`));