const express = require('express');
const router = express.Router();

const { URLS } = require('../../config');

const {
    notFoundHandler,
    useMessageHandler,
} = require('./handlers');

function Router({ answer }) {

    router.post(URLS.MESSAGE, useMessageHandler(answer));

    router.all('/*path', notFoundHandler);

    return router;
}

module.exports = Router;