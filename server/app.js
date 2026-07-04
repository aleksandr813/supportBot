const express = require('express');
const CONFIG = require('./config');
const Router = require('./application/router/Router');
const Answer = require('./application/answer');
const Common = require('./application/modules/common/Common');
const Mediator = require('./application/modules/Mediator');
const DB = require('./application/modules/db/DB');
const UserManager = require('./application/modules/user/UserManager');
const ConversationManager = require('./application/modules/conversation/ConversationManager');
const BotManager = require('./application/modules/bot/BotManager');
const OperatorManager = require('./application/modules/operator/OperatorManager');
//const server = require('http');

const { PORT, CORS } = CONFIG;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: CONFIG.CORS});

const answer = new Answer();
const common = new Common();
const db = new DB(CONFIG);
const mediator = new Mediator(CONFIG.MEDIATOR);

new BotManager({mediator, db, io, answer, common});
new UserManager({ mediator, db, io, answer, common });
new ConversationManager({ mediator, io, db, answer, common });
new OperatorManager({ mediator, db, io, answer, common });

app.use(CONFIG.CORS.middleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/public`));
app.use('/', new Router(answer, mediator));

const startLog = `supportBot Server started at PORT ${PORT} \nwith CORS: ${CONFIG.CORS.origin}`;

server.listen(PORT, () => console.log(startLog));