const axios = require('axios');
const cheerio = require('cheerio');

const searchCriteria = [
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%87%D0%B5%D1%82%D0%B2%D0%B5%D1%80%D1%82%D0%B5-%D0%BA%D1%80%D0%B8%D0%BB%D0%BE/',
        email: "desares526@gmail.com",
        minPrice: 350,
        maxPrice: 525,
        tags: ["Четверте", "Крило", "Яррос"]
    },
    {
        url: 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%81%D1%82%D1%80%D0%B0%D1%85-%D0%BC%D1%83%D0%B4%D1%80%D0%B5%D1%86%D1%8F/',
        email: "desares526@gmail.com",
        minPrice: 350,
        maxPrice: 525,
        tags: ["Страх", "Мудреця", "Ротфусс"]
    },
];



const scrapData = (url, minPrice, maxPrice, tags) => axios(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html, { decodeEntities: false });
        const gridContainer = $('div[data-cy="l-card"]');
        const goodsData = [];

        gridContainer.each(function () {
            const name = $(this).find('a > div > div > div > div.css-u2ayx9 > h6').text();
            const priceMatch = $(this).find('a > div > div > div > div.css-u2ayx9 > p').text().match(/((\d )?\d{2,3} грн)/);
            const price = priceMatch ? priceMatch[0].replace(/[^\d]/g, '') : '';
            const condition = $(this).find('a > div > div > div > div.css-iqvdlb > span > span > span').text();
            const [location, date] = $(this).find('a > div > div > div > div.css-odp1qd > p').text().split(' - ');

            const matchedTags = tags.filter(tag => name.includes(tag));
            if (price <= maxPrice && price >= minPrice && matchedTags.length >= 2) {
                goodsData.push({
                    name,
                    price,
                    condition,
                    location,
                    date,
                });
            }
        });

        if (goodsData != [])
            console.log(goodsData);
        else
            console.log("Nothing matches your criteria")
    })
    .catch(console.error);

searchCriteria.forEach((item) => {
    scrapData(item.url, item.minPrice, item.maxPrice, item.tags)
});