const express = require('express');
const { Bot } = require('@maxhub/max-bot-api');
const CONFIG = require('./config');

const bot = new Bot(CONFIG.BOT_TOKEN);

bot.on('message_created', (ctx) => {
  const message = ctx.message; // Полученное сообщение
});


// Устанавливает список команд, который пользователь будет видеть в чате с ботом
bot.api.setMyCommands([
  {
    name: 'hello',
    description: 'Поприветствовать бота',
  },
]);  

// Обработчик команды '/hello'
bot.command('hello', (ctx) => {
  return ctx.reply('Привет! ✨');
});
bot.start();
