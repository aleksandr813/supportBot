const express = require('express');
const CONFIG = require('./config');
const Router = require('./application/router/Router');
const Answer = require('./application/answer');
const Mediator = require('./application/modules/Mediator');
const DB = require('./application/modules/db/DB');
const UserManager = require('./application/modules/user/UserManager');
const ConversationManager = require('./application/modules/conversation/ConversationManager');
//const server = require('http');

const { PORT } = CONFIG;

const answer = new Answer();
const db = new DB(CONFIG);
const mediator = new Mediator(CONFIG.MEDIATOR);

new UserManager({ mediator, db, answer });
new ConversationManager({ mediator, db, answer });

const app = express();
//server.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/', new Router(answer, mediator))

app.listen(PORT, (error) =>{
    if(!error)
        console.log(`Server is started at PORT ${PORT}`);
    else 
        console.log("Error occurred, server can't start", error);
    }
);