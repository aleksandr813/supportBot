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

    INTERVALS: {
        TEMP_CLEANUP: 12 * 60 * 60 * 1000,
        TEMP_MAX_FILE_AGE: 24 * 60 * 60 * 1000
    },

    DATABASE: 'data.db',

    MEDIATOR: {
        EVENTS: {
            NEW_MESSAGE: 'NEW_MESSAGE',
            ADD_USER: 'ADD_USER',
            CREATE_CONVERSATION: 'CREATE_CONVERSATION',
            SET_USER_CONVERSATION: 'SET_USER_CONVERSATION',
            END_CONVERSATION: 'END_CONVERSATION',
            SEND_MESSAGE: 'SEND_MESSAGE',
            DELETE_ALL_CONVERSATIONS: 'DELETE_ALL_CONVERSATIONS',
        },
        TRIGGERS: {
            GET_USER: 'GET_USER',
            GET_BOT_BY_TOKEN: 'GET_BOT_BY_TOKEN',
            GET_BOT_BY_USER_GUID: 'GET_BOT_BY_USER_GUID',
            GET_USER_BY_CONVERSATION_GUID: 'GET_USER_BY_CONVERSATION_GUID',
            CHECK_OPERATOR_TOKEN: 'CHECK_OPERATOR_TOKEN',
        },
    },

    URLS: {
        MESSAGE: '/newMessage',
        ADD_USER: '/addUser',
        CREATE_CONVERSATION: '/createConversation',
        END_CONVERSATION: '/endConversation',
        GET_USER: '/getUser',
    },

    SOCKET: {
        LOGIN: 'LOGIN',
        LOGOUT: 'LOGOUT',
        GET_CONVERSATIONS: 'GET_CONVERSATIONS',
        GET_CONVERSATION_INFO: 'GET_CONVERSATION_INFO',
        GET_CONVERSATION_MESSAGES: 'GET_CONVERSATION_MESSAGES',
        SEND_MESSAGE: 'SEND_MESSAGE',
        NEW_MESSAGE: 'NEW_MESSAGE',
        DELETE_ALL_CONVERSATIONS: 'DELETE_ALL_CONVERSATIONS',
    },
}

module.exports = CONFIG;