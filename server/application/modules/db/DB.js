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

    addMessage(message) {
        //this.orm.insert("messages")
    }

    getUser(userId, botId) {
        const user = orm.get('users', { external_id: userId, bot_id: botId });
        return user;
    }

    createUser(userId, botId, username) {
        this.orm.insert('users', { external_id: userId, bot_id: botId, username: username });
    }
}

module.exports = DB;