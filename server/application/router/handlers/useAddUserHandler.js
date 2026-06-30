module.exports = (answer, mediator) => {
    const { ADD_USER } = mediator.getEventTypes();
    return async (req, res) => {

        const user = {
            token,
            username,
            externalId,
            phone
        } = req.body;

        const { GET_BOT } = mediator.getTriggerTypes();
        if (!user.token || !mediator.get(GET_BOT, user.token)) {
            return res.send(answer.bad(403));
        }

        if (!user.username || !user.externalId) {
            return res.send(answer.bad(242));
        }
        
        const response = await mediator.call(ADD_USER, user);

        if (response) {
            return res.send(response);
        }

        return res.send(answer.bad(9000));
    };
};

