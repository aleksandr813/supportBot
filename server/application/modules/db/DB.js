const sqlite3 = require('sqlite3').verbose();
const ORM = require('./ORM');


class DB {
    constructor({ DATABASE }) {
        this.db = new sqlite3.Database(`${__dirname}/${DATABASE}`);
        this.orm = new ORM(this.db);
        this.initTables();
    }

    initTables() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS "bots" (
                    "bot_guid" TEXT NOT NULL UNIQUE,
                    "token" TEXT UNIQUE,
                    PRIMARY KEY("bot_guid")
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS "roles" (
                    "role_id" INTEGER NOT NULL UNIQUE,
                    "role" TEXT,
                    PRIMARY KEY("role_id")
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS "users" (
                    "user_guid" TEXT NOT NULL UNIQUE,
                    "external_id" TEXT NOT NULL,
                    "username" TEXT,
                    "bot_guid" TEXT,
                    "current_conversation" TEXT,
                    PRIMARY KEY("user_guid"),
                    FOREIGN KEY("current_conversation") REFERENCES "conversations"("conversation_guid")
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS "conversations" (
                    "conversation_guid" TEXT NOT NULL UNIQUE,
                    "bot_guid" TEXT,
                    "external_id" TEXT NOT NULL,
                    "role" TEXT,
                    PRIMARY KEY("conversation_guid"),
                    FOREIGN KEY("bot_guid") REFERENCES "bots"("bot_guid"),
                    FOREIGN KEY("external_id") REFERENCES "users"("external_id")
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS "messages" (
                    "message_id" INTEGER NOT NULL UNIQUE,
                    "text" TEXT NOT NULL,
                    "conversation_guid" TEXT NOT NULL,
                    "user_guid" TEXT NOT NULL,
                    "date" TEXT NOT NULL,
                    PRIMARY KEY("message_id" AUTOINCREMENT),
                    FOREIGN KEY("conversation_guid") REFERENCES "conversations"("conversation_guid"),
                    FOREIGN KEY("user_guid") REFERENCES "users"("user_guid")
                )
            `);
        });
    }

    getBots() {
        return this.orm.all('bots');
    }

    getUser(externalId, botGuid) {
        return this.orm.get('users', { external_id: externalId, bot_guid: botGuid });
    }

    createUser(userGuid, externalId, botGuid, username) {
        return this.orm.insert('users', {
            user_guid: userGuid,
            external_id: externalId,
            bot_guid: botGuid,
            username: username,
        });
    }

    getConversation(conversationGuid, botGuid) {
        return this.orm.get('conversations', { conversation_guid: conversationGuid, bot_guid: botGuid });
    }

    createConversation(conversationGuid, botGuid, externalId, role) {
        return this.orm.insert('conversations', {
            conversation_guid: conversationGuid,
            bot_guid: botGuid,
            external_id: externalId,
            role: role,
        });
    }

    setUserConversation(oldConversationGuid, newConversationGuid) {
        return this.org.update("users", 
            { current_conversation: newConversationGuid }, 
            { current_conversation: oldConversationGuid },
        );
    }

    addMessage(text, conversationGuid, answer, date) {
        return this.orm.insert('messages', {
            text: text,
            conversation_guid: conversationGuid,
            answer: answer,
            date: date,
        });
    }
}

module.exports = DB;