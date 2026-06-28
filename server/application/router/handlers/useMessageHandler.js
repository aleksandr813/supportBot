module.exports = (answer, mediator) => {
    const { NEW_MESSAGE } = mediator.getEventTypes();
    return (req, res) => {

        const message = {
            token,
            role,
            conversation_id,
            username,
            user_id,
            text,
        } = req.body;

        if (!message.token || !message.role || !message.conversation_id || !message.user_id || !message.text) {
            return res.send(answer.bad(242));
        }
        
        const response = mediator.call(NEW_MESSAGE, message);

        if (response?.result) {
            return res.send(response);
        }

        return res.send(answer.bad(9000));
    };
};

