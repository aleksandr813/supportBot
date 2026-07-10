const { Keyboard } = require('@maxhub/max-bot-api');
const CONFIG = require('./config');

const { ROLES } = CONFIG;

const phoneKeyboard = Keyboard.inlineKeyboard([
    [Keyboard.button.requestContact('Отправить номер телефона')],
]);

const roleKeyboard = Keyboard.inlineKeyboard([
    [Keyboard.button.callback(ROLES.student, 'role:student')],
    [Keyboard.button.callback(ROLES.employee, 'role:employee')],
    [Keyboard.button.callback(ROLES.other, 'role:other')],
]);

module.exports = { phoneKeyboard, roleKeyboard };