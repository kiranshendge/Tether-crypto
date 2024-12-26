const axios = require('axios');
const logger = require('./logger');

async function fetchTopCryptocurrencies() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 5,
                page: 1
            }
        });
        const topCryptos = response.data.map(crypto => ({
            id: crypto.id,
            symbol: crypto.symbol,
            name: crypto.name
        }));
        logger.info('Fetched top 5 cryptocurrencies from CoinGecko');
        return topCryptos;
    } catch (error) {
        logger.error(`Error fetching top cryptocurrencies: ${error.message}`);
        throw error;
    }
}

module.exports = fetchTopCryptocurrencies;
