const cron = require('node-cron');
const fetchAveragePrices = require('./processPrices');
const storeData = require('./storeData');
const logger = require('./logger');

function startScheduler() {
    cron.schedule('*/30 * * * * *', async () => {
        logger.info('Starting scheduled job to fetch and store crypto prices');
        const averagePrices = await fetchAveragePrices();
        if (averagePrices) {
            await storeData(averagePrices);
        }
    });
}

module.exports = startScheduler;
