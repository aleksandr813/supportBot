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
                CREATE TABLE IF NOT EXISTS "conversations" (
                    "conversation_guid" TEXT NOT NULL UNIQUE,
                    "bot_guid" TEXT,
                    "external_id" TEXT NOT NULL,
                    "role" TEXT,
                    "start_date" TEXT,
                    "last_date" TEXT,
                    PRIMARY KEY("conversation_guid"),
                    FOREIGN KEY("bot_guid") REFERENCES "bots"("bot_guid"),
                    FOREIGN KEY("external_id") REFERENCES "users"("external_id")
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS "users" (
                    "user_guid" TEXT NOT NULL UNIQUE,
                    "external_id" TEXT NOT NULL,
                    "username" TEXT,
                    "bot_guid" TEXT,
                    "current_conversation" TEXT,
                    "phone" TEXT,
                    PRIMARY KEY("user_guid"),
                    FOREIGN KEY("current_conversation") REFERENCES "conversations"("conversation_guid")
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

            this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_conversations_date_guid 
                ON conversations(last_date DESC, conversation_guid DESC)
            `);

            this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_messages_conv_id 
                ON messages(conversation_guid, message_id DESC)
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

    createConversation(conversationGuid, botGuid, externalId, role, date) {
        return this.orm.insert('conversations', {
            conversation_guid: conversationGuid,
            bot_guid: botGuid,
            external_id: externalId,
            role: role,
            start_date: date,
        });
    }

    setUserConversation(externalId, botGuid, newConversationGuid) {
        return this.orm.update("users", 
            { current_conversation: newConversationGuid }, 
            { external_id: externalId, bot_guid: botGuid },
        );
    }

    addMessage(text, conversationGuid, userGuid, date) {
        this.orm.update('conversations', 
            { last_date: date },
            { conversation_guid: conversationGuid },
        );

        return this.orm.insert('messages', {
            text: text,
            conversation_guid: conversationGuid,
            user_guid: userGuid,
            date: date,
        });
    }

    getOperatorByLogin(name) {
        return this.orm.get('operators', {name: name});
    }

    getConversationsList(limit = 20, cursor) {
        let sql = `
            SELECT 
                c.conversation_guid,
                u.username,
                c.last_date,
                c.role,
                (
                    SELECT m.text 
                    FROM messages m 
                    WHERE m.conversation_guid = c.conversation_guid 
                    ORDER BY m.message_id DESC 
                    LIMIT 1
                ) AS last_message
            FROM conversations c
            JOIN users u ON u.external_id = c.external_id AND u.bot_guid = c.bot_guid
        `;
        const values = [];

        if (cursor) {
            sql += ` WHERE (c.last_date < ? OR (c.last_date = ? AND c.conversation_guid < ?))`;
            values.push(cursor.lastDate, cursor.lastDate, cursor.conversationGuid);
        }

        sql += ` ORDER BY c.last_date DESC, c.conversation_guid DESC LIMIT ?`;
        values.push(limit);

        return this.orm.raw(sql, values);
    }

    getConversationInfo(conversationGuid) {
        const sql = `
            SELECT 
                c.role,
                u.username,
                u.phone
                FROM conversations c
                JOIN users u ON u.external_id = c.external_id AND u.bot_guid = c.bot_guid
				WHERE c.conversation_guid = ?
        `;

        return this.orm.raw(sql, [conversationGuid])
    }

    getConversationMessages(conversationGuid, { limit = 20, cursor = null } = {}) {
        let sql = `
            SELECT
                m.message_id,
                m.text,
                m.date,
                u.external_id
            FROM messages m
            JOIN users u ON m.user_guid = u.user_guid
            WHERE m.conversation_guid = ?
        `;
        const values = [conversationGuid];

        if (cursor) {
            sql += ` AND m.message_id < ?`;
            values.push(cursor);
        }

        sql += ` ORDER BY m.message_id DESC LIMIT ?`;
        values.push(limit);

        return this.orm.raw(sql, values);
    }

    getUserByConversationGuid(conversationGuid) {
        return this.orm.get('users', {current_conversation: conversationGuid});
    }

}

module.exports = DB;