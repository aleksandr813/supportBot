const CONFIG = require('../../config');

module.exports = (bot, answer) => {
    return async (req, res) => {
        const { token, externalId, text } = req.body || {};

        if (!token || token !== CONFIG.BOT_TOKEN) {
            return res.send(answer.bad(243));
        }

        if (!externalId || !text) {
            return res.send(answer.bad(242));
        }

        const userId = Number(externalId);

        try {
            await bot.api.sendMessageToUser(userId, text);
            return res.send(answer.good(true));
        } catch (error) {
            console.error('sendMessageToUser failed:', error);
            return res.send(answer.bad(2002));
        }
    };
};
