const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { URLS } = require('../config');

const {
    useSendMessageHandler,
    useUploadAttachmentHandler,
} = require('./handlers');

function Router(bot, answer) {

    router.post(URLS.SEND_MESSAGE, useSendMessageHandler(bot, answer));
    router.post('/uploadAttachment', upload.single('file'), useUploadAttachmentHandler(bot, answer));

    return router;
}

module.exports = Router;