const axios = require('axios');
const cheerio = require('cheerio');
const { sendMessage, startBot, stopBot } = require('./messageSender');

const searchCriteria = [
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%87%D0%B5%D1%82%D0%B2%D0%B5%D1%80%D1%82%D0%B5-%D0%BA%D1%80%D0%B8%D0%BB%D0%BE/?currency=UAH&search%5Border%5D=created_at:desc',
        telegramUserId: 650512143,
        minPrice: 350,
        maxPrice: 700,
        tags: ["Четверте", "крило", "Яррос"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%81%D1%82%D1%80%D0%B0%D1%85-%D0%BC%D1%83%D0%B4%D1%80%D0%B5%D1%86%D1%8F/?currency=UAH&search%5Border%5D=created_at:desc',
        telegramUserId: 650512143,
        minPrice: 350,
        maxPrice: 700,
        tags: ["Страх", "Страхи", "мудреця", "Ротфусс"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D0%B2%D0%B1%D0%B8%D0%B2%D1%81%D1%82%D0%B2%D0%BE-%D1%83-%D1%81%D1%85%D1%96%D0%B4%D0%BD%D0%BE%D0%BC%D1%83-%D0%B5%D0%BA%D1%81%D0%BF%D1%80%D0%B5%D1%81%D1%96/?currency=UAH&search%5Border%5D=created_at%3Adesc',
        telegramUserId: 650512143,
        minPrice: 150,
        maxPrice: 230,
        tags: ["Вбивство", "східному", "експресі", "Агата", "Аґата", "Крісті"]
    },
    {
        url: 'https://www.olx.ua/uk/list/q-%D0%A1%D0%BC%D0%B5%D1%80%D1%82%D1%8C-%D0%BD%D0%B0-%D0%9D%D1%96%D0%BB%D1%96/?search%5Border%5D=created_at:desc#821125949',
        telegramUserId: 650512143,
        minPrice: 150,
        maxPrice: 260,
        tags: ["Смерть", "Нілі", "Агата", "Аґата", "Крісті"]
    },
    {
        url: 'https://www.olx.ua/uk/list/q-%D0%A3%D0%B1%D0%B8%D0%B2%D1%81%D1%82%D0%B2%D0%B0-%D0%B7%D0%B0-%D0%B0%D0%B1%D0%B5%D1%82%D0%BA%D0%BE%D1%8E/?search%5Border%5D=created_at:desc',
        telegramUserId: 650512143,
        minPrice: 150,
        maxPrice: 240,
        tags: ["Убивства", "абеткою", "Агата", "Крісті"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%8F-%D0%B1%D0%B0%D1%87%D1%83-%D0%B2%D0%B0%D1%81-%D1%86%D1%96%D0%BA%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BF%D1%96%D1%82%D1%8C%D0%BC%D0%B0/?currency=UAH&search%5Border%5D=created_at:desc',
        telegramUserId: 650512143,
        minPrice: 350,
        maxPrice: 430,
        tags: ["Я", "бачу", "цікавить", "пітьма", "Ілларіон", "Павлюк"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D0%92%D0%B5%D1%87%D1%96%D1%80%D0%BA%D0%B0-%D0%BD%D0%B0-%D0%93%D0%B5%D0%BB%D0%BB%D0%BE%D0%B2%D1%96%D0%BD/?currency=UAH&search%5Border%5D=created_at:desc',
        telegramUserId: 650512143,
        minPrice: 150,
        maxPrice: 230,
        tags: ["Вечірка", "Гелловін", "Привиди", "Венеції", "Агата", "Аґата", "Крісті"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%82%D0%B0%D0%BD%D1%86%D1%96-%D0%B7-%D0%BA%D1%96%D1%81%D1%82%D0%BA%D0%B0%D0%BC%D0%B8/?currency=UAH&search%5Border%5D=created_at:desc',
        telegramUserId: 650512143,
        minPrice: 200,
        maxPrice: 280,
        tags: ["Танці", "кістками", "Андрій ", "Семʼянків"]
    },
];

let previousResults = {};

const areResultsEqual = (results1, results2) => {
    return JSON.stringify(results1) === JSON.stringify(results2);
};

const scrapeItemData = ($item, tags, minPrice, maxPrice) => {
    const id = $item.attr('id');
    const name = $item.find('a > div > div > div > div.css-u2ayx9 > h6').text();
    const priceMatch = $item.find('a > div > div > div > div.css-u2ayx9 > p').text().match(/((\d )?\d{2,3} грн)/);
    const price = priceMatch ? +priceMatch[0].replace(/[^\d]/g, '') : '';
    const link = "https://www.olx.ua/" + $item.find('a ').attr('href');
    const condition = $item.find('a > div > div > div > div.css-iqvdlb > span > span > span').text();
    const [location, date] = $item.find('a > div > div > div > div.css-odp1qd > p').text().split(' - ');

    const matchedTags = tags.filter(tag => name.includes(tag));
    if (price <= maxPrice && price >= minPrice && matchedTags.length >= 2) {
        return {
            id,
            name,
            price,
            condition,
            link,
            location,
            date,
        };
    }
    return null;
};

const generateMessageText = (item, index) => {
    let message = `\n${index}) ${item.name} стан ${item.condition} за ціною ${item.price} грн о ${item.date} \nОзнайомитися з ним можливо за посиланням ${item.link}`;

    return message;
}

const updateResultsArray = (userResults, newGoodsData) => {
    let updatedIndex = newIndex = 1;

    let newGoodsMessage = "";
    let updatedGoodsMessage = "";

    newGoodsData.forEach(item => {
        const userItemIndex = userResults.findIndex(userItem => userItem.id === item.id);

        if (userItemIndex !== -1) {
            updatedGoodsMessage += generateMessageText(item, updatedIndex, true);
            updatedIndex++;

            userResults[userItemIndex] = item;
        } else {
            newGoodsMessage += generateMessageText(item, newIndex, false);
            newIndex++;

            userResults.push(item);
        }
    });

    return { newGoodsMessage, updatedGoodsMessage };
};

const sendMessages = (userId, newGoodsMessage, updatedGoodsMessage, bookName, count) => {
    if (newGoodsMessage) {
        newGoodsMessage = "З'явились нові оголошення:\n" + newGoodsMessage;
        sendMessage(userId, newGoodsMessage);

        console.log(`Sending new goods message... ${bookName} ${count}`);
    }

    if (updatedGoodsMessage) {
        updatedGoodsMessage = "Оголошення було оновлено:\n" + updatedGoodsMessage;
        sendMessage(userId, updatedGoodsMessage);

        console.log(`Sending updated goods message... ${bookName} ${count}`);
    }
};

const scrapDataAndUpdateResults = async (url, minPrice, maxPrice, tags, userId) => {
    try {
        const response = await axios(url);
        const html = response.data;
        const $ = cheerio.load(html, { decodeEntities: false });
        const gridContainer = $('div[data-cy="l-card"]');
        const goodsData = [];

        gridContainer.each(function () {
            const $item = $(this);
            const itemData = scrapeItemData($item, tags, minPrice, maxPrice);

            if (itemData) {
                goodsData.push(itemData);
            }
        });

        if (goodsData.length > 0) {
            previousResults[userId] = previousResults[userId] || {};
            previousResults[userId][url] = previousResults[userId][url] || [];

            const userResults = previousResults[userId][url];
            const newGoodsData = goodsData.filter(item => {
                const userItemIndex = userResults.findIndex(userItem => userItem.id === item.id);
                return (userItemIndex !== -1) ? !areResultsEqual(userResults[userItemIndex], item) : true;
            });

            if (newGoodsData.length > 0) {
                const { newGoodsMessage, updatedGoodsMessage } = updateResultsArray(userResults, newGoodsData);
                sendMessages(userId, newGoodsMessage, updatedGoodsMessage, newGoodsData[0].name, goodsData.length);

                previousResults[userId][url] = userResults;
            } else {
                console.log(`Nothing new. Skipping message... ${userResults[0].name} ${userResults.length}`);
            }
        }
        else
            console.log("Nothing matches your criteria")
    } catch (error) {
        console.error(error);
    }
};

startBot();

const getTime = () => {
    const currentTime = new Date();

    const year = currentTime.getFullYear();
    const month = currentTime.getMonth() + 1;
    const day = currentTime.getDate();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const runScrapData = async () => {
    while (true) {
        for (const criteriaItem of searchCriteria) {
            await scrapDataAndUpdateResults(criteriaItem.url, criteriaItem.minPrice, criteriaItem.maxPrice, criteriaItem.tags, criteriaItem.telegramUserId);
        }
        // await new Promise(resolve => setTimeout(resolve, 15000));
        console.log(`------------------------${getTime()}--------------------------`)
        sendMessage(650512143, "End of the cycle at " + getTime());
        await new Promise(resolve => setTimeout(resolve, 600000));
    }
};

runScrapData();

stopBot();