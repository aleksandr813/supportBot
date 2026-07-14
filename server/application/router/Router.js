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
    router.post('/upload', upload.single('file'), useUploadHandler(answer, mediator));
    router.get('/videoProxy', useVideoProxyHandler(answer, mediator));

    router.all('/*path', notFoundHandler);

    return router;
}

module.exports = Router;