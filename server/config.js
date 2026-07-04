const CONFIG = {

    CORS: {
        origin: "*",
        middleware: (_, res, next) => {
            res.header('Content-Type', 'application/json; charset=utf-8');
            res.header('Access-Control-Allow-Origin', '*');
            next();
        }
    },
    PORT: 3003,

    DATABASE: 'data.db',

    MEDIATOR: {
        EVENTS: {
            NEW_MESSAGE: 'NEW_MESSAGE',
            ADD_USER: 'ADD_USER',
            CREATE_CONVERSATION: 'CREATE_CONVERSATION',
            SET_USER_CONVERSATION: 'SET_USER_CONVERSATION',
            END_CONVERSATION: 'END_CONVERSATION',
        },
        TRIGGERS: {
            GET_USER: 'GET_USER',
            GET_BOT: 'GET_BOT',
        },
    },

    URLS: {
        MESSAGE: '/newMessage',
        ADD_USER: '/addUser',
        CREATE_CONVERSATION: '/createConversation',
        END_CONVERSATION: '/endConversation',
    },

    SOCKET: {
        LOGIN: 'LOGIN',
    },
}

module.exports = CONFIG;