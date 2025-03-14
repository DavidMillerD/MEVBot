require('dotenv').config();
const { ethers } = require('ethers');

console.log('Starting MEV Bot...');

let provider;

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

async function main() {
    await initProvider();
    console.log('MEV Bot initialized');
    
    // Basic monitoring loop
    setInterval(() => {
        console.log('Scanning for opportunities...');
    }, 10000);
}

main().catch(console.error);