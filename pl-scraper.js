const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.premierleague.com/stats/top/players/goals?se=-1&cl=-1&iso=-1&po=-1?se=-1';

axios(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html)
        const statsTable = $('.statsTableContainer > tr');
        const topPremierLeagueScorers = [];

        statsTable.each(function () {
            const rank = $(this).find('.stats-table__rank').text();
            const playerName = $(this).find('.playerName').text().trim();
            const nationality = $(this).find('td > div > span').text();
            const goals = $(this).find('.stats-table__main-stat').text();
            topPremierLeagueScorers.push({
                rank,
                player: playerName,
                nationality,
                goals,
            });
        });

        console.log(topPremierLeagueScorers);
    })
    .catch(console.error);