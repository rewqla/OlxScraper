const sendMessage = (userId, message) => {
    require('dotenv').config();

    const telegramBot = require('node-telegram-bot-api');
    const token = process.env.TOKEN;
    const bot = new telegramBot(token, { polling: true });

    bot.sendMessage(userId, message);
}

module.exports = { sendMessage }