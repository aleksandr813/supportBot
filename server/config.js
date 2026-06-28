const CONFIG = {
    PORT: 3003,
    CORS: "*",

    MEDIATOR: {
        EVENTS: {
            NEW_MESSAGE: 'NEW_MESSAGE', // обработка нового сообщение
        },
        TRIGGERS: {

        },
    },

    URLS: {
        MESSAGE: '/message',
    }
}

module.exports = CONFIG;