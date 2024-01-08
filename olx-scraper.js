const axios = require('axios');
const cheerio = require('cheerio');
const { sendMessage, startBot, stopBot } = require('./messageSender');

const searchCriteria = [
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%87%D0%B5%D1%82%D0%B2%D0%B5%D1%80%D1%82%D0%B5-%D0%BA%D1%80%D0%B8%D0%BB%D0%BE/',
        telegramUserId: 650512143,
        minPrice: 350,
        maxPrice: 600,
        tags: ["Четверте", "Крило", "Яррос"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%81%D1%82%D1%80%D0%B0%D1%85-%D0%BC%D1%83%D0%B4%D1%80%D0%B5%D1%86%D1%8F/',
        telegramUserId: 650512143,
        minPrice: 350,
        maxPrice: 600,
        tags: ["Страх", "Мудреця", "Ротфусс"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D0%B2%D0%B1%D0%B8%D0%B2%D1%81%D1%82%D0%B2%D0%BE-%D1%83-%D1%81%D1%85%D1%96%D0%B4%D0%BD%D0%BE%D0%BC%D1%83-%D0%B5%D0%BA%D1%81%D0%BF%D1%80%D0%B5%D1%81%D1%96/?currency=UAH&search%5Border%5D=created_at:desc',
        telegramUserId: 650512143,
        minPrice: 150,
        maxPrice: 200,
        tags: ["Вбивство", "Східному", "Експресі", "Крісті"]
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

function generateMessageText(goodsData) {
    let message = "З'явились нові оголошення за вашим запитом\n";

    goodsData.forEach((item, index) => {
        message += `\n${index + 1}) ${item.name} стан ${item.condition} за ціною ${item.price} грн о ${item.date} \nОзнайомитися з ним можливо за посиланням ${item.link}`;
    });

    return message;
}

const scrapDataAndUpdateResults = (url, minPrice, maxPrice, tags, userId) => axios(url)
    .then(response => {
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
            if (!previousResults[userId]) {
                previousResults[userId] = {};
            }

            if (!previousResults[userId][url]) {
                previousResults[userId][url] = [];
            }

            const userResults = previousResults[userId][url];
            const newGoodsData = goodsData.filter(item => {
                const userItemIndex = userResults.findIndex(userItem => userItem.id === item.id);
                if (userItemIndex !== -1) {
                    if (!areResultsEqual(userResults[userItemIndex], item))
                        return item;
                } else {
                    return item;
                }
            });

            if (newGoodsData.length > 0) {
                const message = generateMessageText(newGoodsData);
                sendMessage(userId, message);

                console.log("Sending new message... " + goodsData[0].name + " " + goodsData.length);

                newGoodsData.forEach(item => {
                    const userItemIndex = userResults.findIndex(userItem => userItem.id === item.id);

                    if (userItemIndex !== -1) {
                        userResults[userItemIndex] = item;
                    } else {
                        userResults.push(item);
                    }
                })

                previousResults[userId][url] = userResults;
            } else {
                console.log("Nothing new. Skipping message... " + goodsData.length);
            }
        }
        else
            console.log("Nothing matches your criteria")
    })
    .catch(console.error);

startBot();


const runScrapData = async () => {
    while (true) {
        for (const criteriaItem of searchCriteria) {
            await scrapDataAndUpdateResults(criteriaItem.url, criteriaItem.minPrice, criteriaItem.maxPrice, criteriaItem.tags, criteriaItem.telegramUserId);
        }
        // await new Promise(resolve => setTimeout(resolve, 15000));
        await new Promise(resolve => setTimeout(resolve, 600000));
        // await new Promise(resolve => setTimeout(resolve, 900000));
    }
};

runScrapData();

stopBot();