const axios = require('axios');
const logger = require('./logger');

async function fetchTickers(cryptoId) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoId}/tickers`);
        const tickers = response.data.tickers
            .filter(ticker => ticker.converted_last.usd) // Ensure the ticker has a USDT price
            .slice(0, 3) // Get the top 3 exchanges
            .map(ticker => ({
                exchange: ticker.market.name,
                price: ticker.converted_last.usd
            }));
        logger.info(`Fetched tickers for ${cryptoId} from CoinGecko`);
        return tickers;
    } catch (error) {
        logger.error(`Error fetching tickers for ${cryptoId}: ${error.message}`);
        return [];
    }
}

module.exports = fetchTickers;
