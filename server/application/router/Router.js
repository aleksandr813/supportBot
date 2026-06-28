const express = require('express');
const router = express.Router();

const { URLS } = require('../../config');

const {
    notFoundHandler,
    useMessageHandler,
} = require('./handlers');

function Router(answer, mediator) {

    router.post(URLS.MESSAGE, useMessageHandler(answer, mediator));

    router.all('/*path', notFoundHandler);

    return router;
}

module.exports = Router;