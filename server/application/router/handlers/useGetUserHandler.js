module.exports = (answer, mediator) => {
    const { GET_BOT_BY_TOKEN } = mediator.getTriggerTypes();
    const { GET_USER } = mediator.getTriggerTypes();
    
    return async (req, res) => {
        const { token, externalId } = req.body;

        if (!token || !mediator.get(GET_BOT_BY_TOKEN, token)) {
            return res.send(answer.bad(403));
        }

        if (!externalId) {
            return res.send(answer.bad(242));
        }

        const botGuid = mediator.get(GET_BOT_BY_TOKEN, token).guid;
        const user = await mediator.get(GET_USER, { externalId, botGuid });

        if (user) {
            return res.send(answer.good(user));
        }

        return res.send(answer.bad(503));
    };
};
