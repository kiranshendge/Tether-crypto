const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');
const logger = require('./logger');

const feed = new Hypercore('./crypto-data', { valueEncoding: 'json' });
const db = new Hyperbee(feed, { keyEncoding: 'utf-8', valueEncoding: 'json' });

async function storeData(data) {
    const batch = db.batch();
    const timestamp = Date.now();
    for (const item of data) {
        await batch.put(`${item.id}-${timestamp}`, item);
    }
    await batch.flush();
    logger.info('Stored data in Hypercore/Hyperbee');
}

module.exports = storeData;