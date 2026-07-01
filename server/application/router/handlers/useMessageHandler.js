module.exports = (answer, mediator) => {
    const { NEW_MESSAGE } = mediator.getEventTypes();
    return async (req, res) => {

        const message = {
            token,
            externalId,
            text,
        } = req.body;

        const { GET_BOT } = mediator.getTriggerTypes();
        if (!message.token || !mediator.get(GET_BOT, message.token)) {
            return res.send(answer.bad(403));
        }

        if (!message.externalId || !message.text) {
            return res.send(answer.bad(242));
        }
        
        const response = await mediator.call(NEW_MESSAGE, message);

        if (response) {
            return res.send(response);
        }
        
        return res.send(answer.bad(9000));
    };
};

