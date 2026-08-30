const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { URLS } = require('../../config');

const {
    notFoundHandler,
    useMessageHandler,
    useAddUserHandler,
    useCreateConversation,
    useEndConversation,
    useUploadHandler,
    useVideoProxyHandler,
    useGetUserHandler,
} = require('./handlers');

function Router(answer, mediator) {

    router.post(URLS.MESSAGE, useMessageHandler(answer, mediator));
    router.post(URLS.ADD_USER, useAddUserHandler(answer, mediator));
    router.post(URLS.CREATE_CONVERSATION, useCreateConversation(answer, mediator));
    router.post(URLS.END_CONVERSATION, useEndConversation(answer, mediator));
    router.post(URLS.GET_USER, useGetUserHandler(answer, mediator));
    router.post(URLS.UPLOAD, upload.single('file'), useUploadHandler(answer, mediator));
    router.get(URLS.VIDEO_PROXY, useVideoProxyHandler(answer, mediator));

    router.all('/*path', notFoundHandler(answer));

    return router;
}

module.exports = Router;