const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');
const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');
const crypto = require('crypto');
const logger = require('./logger');

async function createRPCServer() {
    const hcore = new Hypercore('./db/rpc-server', { valueEncoding: 'json' });
    const hbee = new Hyperbee(hcore, { keyEncoding: 'utf-8', valueEncoding: 'binary' });
    await hbee.ready();

    let dhtSeed = (await hbee.get('dht-seed'))?.value;
    if (!dhtSeed) {
        dhtSeed = crypto.randomBytes(32);
        await hbee.put('dht-seed', dhtSeed);
    }

    const dht = new DHT({
        port: 40001,
        keyPair: DHT.keyPair(dhtSeed),
        bootstrap: [{ host: '127.0.0.1', port: 30001 }]
    });
    await dht.ready();

    let rpcSeed = (await hbee.get('rpc-seed'))?.value;
    if (!rpcSeed) {
        rpcSeed = crypto.randomBytes(32);
        await hbee.put('rpc-seed', rpcSeed);
    }

    const rpc = new RPC({ seed: rpcSeed, dht });
    const rpcServer = rpc.createServer();
    await rpcServer.listen();

    const publicKey = rpcServer.publicKey; 
    if (publicKey) { 
        const publicKeyHex = publicKey.toString('hex'); 
        logger.info(`RPC server started listening on public key: ${publicKeyHex}`); 
    } else { 
        logger.error('Failed to retrieve public key.'); 
    }

    rpcServer.respond('getLatestPrices', async (reqRaw) => { 
        const { pairs } = JSON.parse(reqRaw.toString('utf-8')); 
        const results = []; 
        for (const pair of pairs) { 
            const stream = hbee.createReadStream({ 
                gte: `${pair}-`, 
                lte: `${pair}-\xFF`, 
                reverse: true, // Read in reverse order to get the latest entry first 
                limit: 1 // Limit to 1 entry to get the latest one 
            }); 
            
            await new Promise((resolve, reject) => {
                stream.on('data', (data) => { 
                    const { key, value } = data; 
                    results.push(value); 
                }); 
                
                stream.on('end', resolve); 
                stream.on('error', reject); 
            });
        } 
        const resultsString = JSON.stringify(results); 
        logger.info('Fetched latest prices via RPC'); 
        return Buffer.from(resultsString, 'utf-8'); 
    });

    rpcServer.respond('getHistoricalPrices', async (reqRaw) => {
        const { pairs, from, to } = JSON.parse(reqRaw.toString('utf-8'));
        const results = [];
        for (const pair of pairs) {
            const stream = hbee.createReadStream({ 
                gte: `${pair}-${from}`, 
                lte: `${pair}-${to}` 
            });
            await new Promise((resolve, reject) => {
                stream.on('data', (data) => { 
                    const { key, value } = data; 
                    results.push(value);
                }); 
                
                stream.on('end', resolve); 
                stream.on('error', reject); 
            });
        }
        logger.info('Fetched historical prices via RPC');
        return Buffer.from(JSON.stringify(results), 'utf-8');
    });

    return rpc;
}

module.exports = createRPCServer;