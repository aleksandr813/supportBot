module.exports = (answer, mediator) => {
    const { NEW_MESSAGE } = mediator.getEventTypes();
    return async (req, res) => {

        const message = req.body;
        const { token, externalId, text } = message;

        const { GET_BOT_BY_TOKEN } = mediator.getTriggerTypes();
        if (!message.token || !mediator.get(GET_BOT_BY_TOKEN, message.token)) {
            return res.send(answer.bad(403));
        }

        if (!message.externalId || (!message.text && (!message.attachments || message.attachments.length === 0))) {
            return res.send(answer.bad(242));
        }
        
        const response = await mediator.call(NEW_MESSAGE, message);

        if (response) {
            return res.send(response);
        }
        
        return res.send(answer.bad(9000));
    };
};

