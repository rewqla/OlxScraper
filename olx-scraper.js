const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%87%D0%B5%D1%82%D0%B2%D0%B5%D1%80%D1%82%D0%B5-%D0%BA%D1%80%D0%B8%D0%BB%D0%BE/';
const url2 = 'https://www.olx.ua/uk/hobbi-otdyh-i-sport/knigi-zhurnaly/q-%D1%81%D1%82%D1%80%D0%B0%D1%85-%D0%BC%D1%83%D0%B4%D1%80%D0%B5%D1%86%D1%8F/';

axios(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html, { decodeEntities: false });
        const gridContainer = $('div[data-cy="l-card"]');
        const goodsData = [];

        gridContainer.each(function () {
            const name = $(this).find('a > div > div > div > div.css-u2ayx9 > h6').text();
            const priceMatch = $(this).find('a > div > div > div > div.css-u2ayx9 > p').text().match(/((\d )?\d{2,3} грн)/);
            const price = priceMatch ? priceMatch[0] : '';
            const condition = $(this).find('a > div > div > div > div.css-iqvdlb > span > span > span').text();
            const [location, date] = $(this).find('a > div > div > div > div.css-odp1qd > p').text().split(' - ');

            goodsData.push({
                name,
                price,
                condition,
                location,
                date,
            });
        });

        console.log(goodsData);
    })
    .catch(console.error);