const express = require('express');
const router = express.Router();

const {
    notFoundHandler,
    useMessageHandler,
} = require('./handlers');

function Router({ answer, URLS }) {

    router.post(URLS.MESSAGE, useMessageHandler(answer));

    router.all('/*path', notFoundHandler);

    return router;
}

module.exports = Router;