const fetchTopCryptocurrencies = require('./fetchTopCryptocurrencies');
const fetchTickers = require('./fetchTickers');
const logger = require('./logger');

async function fetchAveragePrices() {
    try {
        const topCryptos = await fetchTopCryptocurrencies();
        const averagePrices = [];
    
        for (const crypto of topCryptos) {
            const tickers = await fetchTickers(crypto.id);
            if (tickers.length === 0) {
                logger.warn(`No tickers found for ${crypto.name}`);
                continue;
            }
    
            const prices = tickers.map(ticker => ticker.price);
            const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
            averagePrices.push({
                id: crypto.id,
                symbol: crypto.symbol,
                name: crypto.name,
                averagePrice,
                exchanges: tickers.map(ticker => ticker.exchange)
            });
        }
        logger.info('Calculated average prices for top cryptocurrencies');
        return averagePrices;
    } catch (error) {
        logger.error(`Error for averagePrices: ${error.message}`);
        throw error;
    }
}

module.exports = fetchAveragePrices;
