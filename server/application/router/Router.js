const express = require('express');
const router = express.Router();

const { URLS } = require('../../config');

const {
    notFoundHandler,
    useMessageHandler,
    useAddUserHandler,
    useCreateConversation,
    useEndConversation,
} = require('./handlers');

function Router(answer, mediator) {

    router.post(URLS.MESSAGE, useMessageHandler(answer, mediator));
    router.post(URLS.ADD_USER, useAddUserHandler(answer, mediator));
    router.post(URLS.CREATE_CONVERSATION, useCreateConversation(answer, mediator));
    router.post(URLS.END_CONVERSATION, useEndConversation(answer, mediator));

    router.all('/*path', notFoundHandler);

    return router;
}

module.exports = Router;