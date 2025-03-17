require('dotenv').config();
const { ethers } = require('ethers');
const { DexUtils, DEX_ADDRESSES } = require('./utils/dex');
const { PairDetector } = require('./utils/pairs');
const { config, validateConfig } = require('./config');

console.log('Starting MEV Bot...');

let provider;
let dexUtils;
let pairDetector;

async function initProvider() {
    try {
        const rpcUrl = process.env.ETHEREUM_RPC_URL;
        if (!rpcUrl) {
            console.error('ETHEREUM_RPC_URL not found in environment');
            process.exit(1);
        }
        
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        console.log(`Connected to ${network.name} (${network.chainId})`);
        
        const blockNumber = await provider.getBlockNumber();
        console.log(`Current block: ${blockNumber}`);
        
    } catch (error) {
        console.error('Failed to connect to Ethereum:', error.message);
        process.exit(1);
    }
}

async function initServices() {
    dexUtils = new DexUtils(provider);
    pairDetector = new PairDetector(provider, DEX_ADDRESSES.UNISWAP_V2_FACTORY);
    
    // Start monitoring new pairs
    await pairDetector.monitorPairCreation();
    
    console.log('DEX utilities initialized');
}

async function scanForOpportunities() {
    try {
        const currentBlock = await provider.getBlockNumber();
        console.log(`Scanning block ${currentBlock} for opportunities...`);
        
        // TODO: Implement actual MEV opportunity detection
        
    } catch (error) {
        console.error('Error scanning for opportunities:', error.message);
    }
}

async function main() {
    try {
        validateConfig();
        await initProvider();
        await initServices();
        
        console.log('MEV Bot fully initialized');
        
        // Start monitoring loop
        setInterval(scanForOpportunities, 12000);
        
    } catch (error) {
        console.error('Failed to start bot:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);