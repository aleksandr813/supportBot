module.exports = (answer, mediator) => {
    const { END_CONVERSATION } = mediator.getEventTypes();
    return async (req, res) => {

        const conversation = {
            token,
            externalId,
        } = req.body;

        const { GET_BOT } = mediator.getTriggerTypes();
        if (!conversation.token || !mediator.get(GET_BOT, conversation.token)) {
            return res.send(answer.bad(403));
        }

        if (!conversation.externalId) {
            return res.send(answer.bad(242));
        }
        
        const response = await mediator.call(END_CONVERSATION, conversation);

        if (response) {
            return res.send(response);
        }

        return res.send(answer.bad(9000));
    };
};
