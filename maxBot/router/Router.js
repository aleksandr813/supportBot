const express = require('express');
const router = express.Router();

const { URLS } = require('../config');

const {
    useSendMessageHandler,
} = require('./handlers');

function Router(bot, answer) {

    router.post(URLS.SEND_MESSAGE, useSendMessageHandler(bot, answer));

    return router;
}

module.exports = Router;