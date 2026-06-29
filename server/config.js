const CONFIG = {
    PORT: 3003,
    CORS: "*",
    DATABASE: 'data.db',

    MEDIATOR: {
        EVENTS: {
            NEW_MESSAGE: 'NEW_MESSAGE', // обработка нового сообщение
        },
        TRIGGERS: {
            GET_USER: 'GET_USER',
        },
    },

    URLS: {
        MESSAGE: '/message',
    }
}

module.exports = CONFIG;