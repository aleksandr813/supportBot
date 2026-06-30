module.exports = (answer, mediator) => {
    const { NEW_MESSAGE } = mediator.getEventTypes();
    return (req, res) => {

        const message = {
            token,
            externalId,
            text,
            date,
        } = req.body;

        const { GET_BOT } = mediator.getTriggerTypes();
        if (!user.token || !mediator.get(GET_BOT, user.token)) {
            return res.send(answer.bad(403));
        }

        if (!message.externalId || !message.text || message.date) {
            return res.send(answer.bad(242));
        }
        
        const response = mediator.call(NEW_MESSAGE, message);

        if (response) {
            return res.send(response);
        }
        
        return res.send(answer.bad(9000));
    };
};

