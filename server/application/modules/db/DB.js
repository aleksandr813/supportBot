const sqlite3 = require('sqlite3').verbose();
const ORM = require('./ORM');


class DB {
    constructor({ DATABASE }) {
        this.db = new sqlite3.Database(`${__dirname}/${DATABASE}`);
        this.orm = new ORM(this.db);
        this.initTables();
    }

    initTables() {
        console.log("Создание/инициализация таблицы")
    }

    getBots() {
        return this.orm.all('bots');
    }

    createConverstation(botId, externalId) {
        
    }

    addMessage(text, externalId, conversationGuid, answer, date) {
        this.orm.insert('message', {
            text: text,
            user_id: externalId,
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