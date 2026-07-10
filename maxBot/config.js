const CONFIG = {
    BOT_TOKEN: "f9LHodD0cOJvRoCDS0p8JCWd1CwmUZ_hnA44kRxKrBebn5i2EqBtMs8VqXT2koSXuzxL021wBj0iARSUZKps",
    PORT: 3004,

    HOST: "localhost:3003",
    SERVER_TOKEN: "123123",

    ROLES: {
        student: 'Студент',
        employee: 'Работник',
        other: 'Другое',
    },

    ERROR_CODES: {
        USER_ALREADY_EXISTS: 501,
        ACTIVE_CONVERSATION_EXISTS: 502,
        PHONE_REQUIRED: 503,
        ROLE_REQUIRED: 504,
    },
};

module.exports = CONFIG;