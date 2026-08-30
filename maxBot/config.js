function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set`);
    }
    return value;
}

const CONFIG = {
    BOT_TOKEN: requireEnv('BOT_TOKEN'),
    PORT: process.env.PORT || 3004,

    HOST: process.env.SERVER_URL || "http://localhost:3003",
    SERVER_TOKEN: requireEnv('SERVER_TOKEN'),

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

    URLS: {
        SEND_MESSAGE: '/sendMessage',
    }
};

module.exports = CONFIG;