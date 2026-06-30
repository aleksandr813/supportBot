const express = require('express');
const router = express.Router();

const { URLS } = require('../../config');

const {
    notFoundHandler,
    useMessageHandler,
    useAddUserHandler,
} = require('./handlers');

function Router(answer, mediator) {

    router.post(URLS.MESSAGE, useMessageHandler(answer, mediator));
    router.post(URLS.ADD_USER, useAddUserHandler(answer, mediator));

    router.all('/*path', notFoundHandler);

    return router;
}

module.exports = Router;