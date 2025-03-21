const { ethers } = require('ethers');

class MempoolMonitor {
    constructor(provider, wsProvider) {
        this.provider = provider;
        this.wsProvider = wsProvider;
        this.pendingTxs = new Map();
        this.isMonitoring = false;
    }

    async startMonitoring() {
        if (!this.wsProvider) {
            console.warn('WebSocket provider not available, mempool monitoring disabled');
            return;
        }

        console.log('Starting mempool monitoring...');
        this.isMonitoring = true;

        this.wsProvider.on('pending', async (txHash) => {
            try {
                const tx = await this.provider.getTransaction(txHash);
                if (tx && this.isInterestingTx(tx)) {
                    await this.processPendingTx(tx);
                }
            } catch (error) {
                // Silently ignore - tx might be mined already
            }
        });
    }

    isInterestingTx(tx) {
        // Check if transaction is related to DEX trading
        const dexRouters = [
            '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2
            '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap
            '0xe592427a0aece92de3edee1f18e0157c05861564'  // Uniswap V3
        ];

        return tx.to && dexRouters.some(router => 
            tx.to.toLowerCase() === router.toLowerCase()
        );
    }

    async processPendingTx(tx) {
        console.log(`Interesting tx found: ${tx.hash}`);
        console.log(`  To: ${tx.to}`);
        console.log(`  Value: ${ethers.utils.formatEther(tx.value)} ETH`);
        console.log(`  Gas Price: ${ethers.utils.formatUnits(tx.gasPrice, 'gwei')} gwei`);

        // Store for potential frontrunning analysis
        this.pendingTxs.set(tx.hash, {
            tx,
            timestamp: Date.now()
        });

        // Clean up old transactions
        this.cleanupOldTxs();
    }

    cleanupOldTxs() {
        const now = Date.now();
        const maxAge = 30000; // 30 seconds

        for (const [hash, data] of this.pendingTxs.entries()) {
            if (now - data.timestamp > maxAge) {
                this.pendingTxs.delete(hash);
            }
        }
    }

    stopMonitoring() {
        this.isMonitoring = false;
        this.wsProvider.removeAllListeners('pending');
        console.log('Mempool monitoring stopped');
    }

    getPendingTxs() {
        return Array.from(this.pendingTxs.values()).map(data => data.tx);
    }
}

module.exports = { MempoolMonitor };