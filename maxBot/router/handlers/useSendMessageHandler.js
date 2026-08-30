const CONFIG = require('../../config');

module.exports = (bot, answer) => {
    return async (req, res) => {
        const { token, externalId, text, attachments } = req.body || {};

        if (!token || token !== CONFIG.SERVER_TOKEN) {
            return res.send(answer.bad(243));
        }

        if (!externalId || (!text && (!attachments || attachments.length === 0))) {
            return res.send(answer.bad(242));
        }

        const userId = Number(externalId);

        try {
            const extra = {};
            if (attachments && attachments.length > 0) {
                extra.attachments = attachments;
            }
            const sentMessage = await bot.api.sendMessageToUser(userId, text || '', extra);
            //console.log("SENT MESSAGE RESPONSE:", JSON.stringify(sentMessage, null, 2));
            
            let attachmentUrl = null;
            let attachmentType = null;
            let attachmentName = null;
            
            if (sentMessage?.body?.attachments && sentMessage.body.attachments.length > 0) {
                const att = sentMessage.body.attachments[0];
                attachmentUrl = att.payload?.url || null;
                attachmentType = att.type || null;
                attachmentName = att.filename || null;
            }

            return res.send(answer.good({
                attachmentUrl,
                attachmentType,
                attachmentName
            }));
        } catch (error) {
            console.error('sendMessageToUser failed:', error);
            return res.send(answer.bad(2002));
        }
    };
};
