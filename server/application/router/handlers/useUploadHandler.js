module.exports = (answer, mediator) => {
    return async (req, res) => {
        const { conversationGuid } = req.body || {};

        if (!conversationGuid) {
            return res.send(answer.bad(242));
        }

        if (!req.file) {
            return res.send(answer.bad(244));
        }

        const TRIGGERS = mediator.getTriggerTypes();

        try {
            const user = await mediator.get(TRIGGERS.GET_USER_BY_CONVERSATION_GUID, conversationGuid);
            if (!user) {
                return res.send(answer.bad(503));
            }

            const bot = mediator.get(TRIGGERS.GET_BOT_BY_USER_GUID, user.bot_guid || user.botGuid);
            if (!bot) {
                return res.send(answer.bad(405));
            }

            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
            const formData = new FormData();
            formData.append('token', bot.token);
            formData.append('file', blob, req.file.originalname);

            const response = await fetch(`${bot.getBaseUrl()}/uploadAttachment`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            return res.send(result);
        } catch (error) {
            console.error('Server upload handler failed:', error);
            return res.send(answer.bad(9000));
        }
    };
};
