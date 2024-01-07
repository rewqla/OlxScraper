const telegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TOKEN;
const bot = new telegramBot(token, { polling: true });

const startBot = () => {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Привіт, готова нарешті купити довгоомрієну книжку?');
    });
};

const stopBot = () => {
    bot.stopPolling();
};

const sendMessage = (userId, message) => {
    bot.sendMessage(userId, message);
};

module.exports = { startBot, stopBot, sendMessage };