module.exports = (answer, mediator) => {
    const { NEW_MESSAGE } = mediator.getEventTypes();
    return (req, res) => {

        const message = {
            token,
            role,
            conversationId,
            username,
            userId,
            text,
        } = req.body;

        if (!message.token || !message.role || !message.conversationId || !message.userId || !message.text) {
            return res.send(answer.bad(242));
        }
        
        const response = mediator.call(NEW_MESSAGE, message);

        if (response?.result) {
            return res.send(response);
        }

        return res.send(answer.bad(9000));
    };
};

