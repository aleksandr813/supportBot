module.exports = (answer, mediator) => {
    const { NEW_MESSAGE } = mediator.getEventTypes();
    return (req, res) => {

        const message = {
            token,
            //role, уходит в запрос создания диалога
            // conversationGuid, хранит бэк в current conversationc 
            //username, уходит в создание пользователя/диалога
            externalId,
            text,
            date,
        } = req.body;

        const { GET_BOT } = mediator.getTriggerTypes();
        if (!user.token || !this.mediator.get(GET_BOT, user.token)) {
            return res.send(answer.bad(403));
        }

        if (!message.role || !message.conversationGuid || !message.externalId || !message.text) {
            return res.send(answer.bad(242));
        }
        
        const response = mediator.call(NEW_MESSAGE, message);

        if (response?.result) {
            return res.send(response);
        }

        return res.send(answer.bad(9000));
    };
};

