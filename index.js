require('dotenv').config();
const { ethers } = require('ethers');
const { DexUtils, DEX_ADDRESSES } = require('./utils/dex');
const { PairDetector } = require('./utils/pairs');
const { MempoolMonitor } = require('./utils/mempool');
const { TransactionAnalyzer } = require('./utils/analyzer');
const { config, validateConfig } = require('./config');

console.log('Starting MEV Bot...');

let provider;
let wsProvider;
let dexUtils;
let pairDetector;
let mempoolMonitor;
let txAnalyzer;

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

        // Initialize WebSocket provider if available
        const wssUrl = process.env.ETHEREUM_WSS_URL;
        if (wssUrl) {
            wsProvider = new ethers.providers.WebSocketProvider(wssUrl);
            console.log('WebSocket provider initialized for mempool monitoring');
        }
        
    } catch (error) {
        console.error('Failed to connect to Ethereum:', error.message);
        process.exit(1);
    }
}

async function initServices() {
    dexUtils = new DexUtils(provider);
    pairDetector = new PairDetector(provider, DEX_ADDRESSES.UNISWAP_V2_FACTORY);
    mempoolMonitor = new MempoolMonitor(provider, wsProvider);
    txAnalyzer = new TransactionAnalyzer(provider);
    
    // Start monitoring new pairs
    await pairDetector.monitorPairCreation();
    
    // Start mempool monitoring
    await mempoolMonitor.startMonitoring();
    
    console.log('All services initialized');
}

async function scanForOpportunities() {
    try {
        const currentBlock = await provider.getBlockNumber();
        console.log(`Scanning block ${currentBlock} for opportunities...`);
        
        // Get pending transactions from mempool
        const pendingTxs = mempoolMonitor.getPendingTxs();
        
        if (pendingTxs.length > 0) {
            console.log(`Analyzing ${pendingTxs.length} pending transactions`);
            
            // Look for sandwich opportunities
            const sandwichTargets = txAnalyzer.identifySandwichOpportunity(pendingTxs);
            
            // Analyze each transaction for arbitrage
            for (const tx of pendingTxs.slice(0, 5)) { // Limit to first 5 to avoid spam
                const analysis = txAnalyzer.analyzeTransaction(tx);
                if (analysis && analysis.type) {
                    const arbOpportunity = txAnalyzer.calculateArbitrageOpportunity(analysis);
                    if (arbOpportunity.profitable) {
                        console.log(`Profitable opportunity found: ${analysis.hash}`);
                    }
                }
            }
        }
        
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