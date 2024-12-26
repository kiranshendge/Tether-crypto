'use strict';

const createRPCServer = require('./createRPCServer');
const startScheduler = require('./scheduler');
const logger = require('./logger');

async function main() {
    logger.info('Starting main process');
    const rpc = await createRPCServer();
    startScheduler();

    process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        await rpc.destroy();
        process.exit();
    });
}

main().catch(error => {
    logger.error(`Error in main process: ${error.message}`);
});
