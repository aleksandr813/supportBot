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
            this.db.run(`CREATE TABLE IF NOT EXISTS bots (
                bot_id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL
            )`);
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                external_id TEXT NOT NULL,
                bot_id INTEGER NOT NULL,
                username TEXT,
                FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
            )`);
            this.db.run(`CREATE TABLE IF NOT EXISTS conversations (
                conversation_guid TEXT PRIMARY KEY,
                bot_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
            )`);
            this.db.run(`CREATE TABLE IF NOT EXISTS messages (
                message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                paths_to_media TEXT,
                conversation_guid TEXT NOT NULL,
                date TEXT NOT NULL,
                answer INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (conversation_guid) REFERENCES conversations(conversation_guid)
            )`);
        });
    }

    getBots() {
        return this.orm.all('bots');
    }

    createConverstation(botId, externalId) {
        
    }

    addMessage(text, conversationGuid, answer, date) {
        this.orm.insert('message', {
            text: text,
            conversation_guid: conversationGuid,
            answer: answer,
            date: date,
        })
    }

    getUser(externalId, botId) {
        const user = orm.get('users', { external_id: externalId, bot_id: botId });
        return user;
    }

    createUser(externalId, botId, username) {
        this.orm.insert('users', { 
            external_id: externalId, 
            bot_id: botId, 
            username: username 
        });
    }
}

module.exports = DB;