'use strict';

const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');
const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');
const crypto = require('crypto');
const logger = require('./logger');

const main = async () => {
    const hcore = new Hypercore('./db/rpc-client', { valueEncoding: 'json' });
    const hbee = new Hyperbee(hcore, { keyEncoding: 'utf-8', valueEncoding: 'binary' });
    await hbee.ready();

    let dhtSeed = (await hbee.get('dht-seed'))?.value;
    if (!dhtSeed) {
        dhtSeed = crypto.randomBytes(32);
        await hbee.put('dht-seed', dhtSeed);
    }

    const dht = new DHT({
        port: 50001,
        keyPair: DHT.keyPair(dhtSeed),
        bootstrap: [{ host: '127.0.0.1', port: 30001 }]
    });
    await dht.ready();

    const serverPubKey = Buffer.from('7e7cb3cfe86978892acfcc4b5dab896de701ca52b97c17773bd3aeb9bae06f84', 'hex');
    const rpc = new RPC({ dht });

    // Call getLatestPrices
    const latestPricesPayload = { 
        pairs: ['bitcoin', 'ethereum', 'ripple'] 
    };
    const latestPricesRaw = await rpc.request(serverPubKey, 'getLatestPrices', Buffer.from(JSON.stringify(latestPricesPayload), 'utf-8'));
    const latestPrices = JSON.parse(latestPricesRaw.toString('utf-8'));    

    // Call getHistoricalPrices
    const historicalPricesPayload = {
        pairs: ['bitcoin', 'ethereum'],
        from: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
        to: Date.now()
    };
    const historicalPricesRaw = await rpc.request(serverPubKey, 'getHistoricalPrices', Buffer.from(JSON.stringify(historicalPricesPayload), 'utf-8'));
    const historicalPrices = JSON.parse(historicalPricesRaw.toString('utf-8'));

    // Closing connection
    await rpc.destroy();
    await dht.destroy();
};

main().catch(error => {
    logger.error(`Error in client: ${error.message}`);
});