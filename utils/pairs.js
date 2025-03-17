const { ethers } = require('ethers');

// Uniswap V2 Factory ABI
const FACTORY_ABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)',
    'event PairCreated(address indexed token0, address indexed token1, address pair, uint)'
];

// Uniswap V2 Pair ABI
const PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
];

class PairDetector {
    constructor(provider, factoryAddress) {
        this.provider = provider;
        this.factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
        this.knownPairs = new Map();
    }

    async getPairAddress(tokenA, tokenB) {
        try {
            const pairAddress = await this.factory.getPair(tokenA, tokenB);
            if (pairAddress === ethers.constants.AddressZero) {
                return null;
            }
            return pairAddress;
        } catch (error) {
            console.error('Error getting pair address:', error.message);
            return null;
        }
    }

    async getPairReserves(pairAddress) {
        try {
            const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, this.provider);
            const reserves = await pairContract.getReserves();
            const token0 = await pairContract.token0();
            const token1 = await pairContract.token1();
            
            return {
                token0,
                token1,
                reserve0: reserves.reserve0,
                reserve1: reserves.reserve1,
                blockTimestamp: reserves.blockTimestampLast
            };
        } catch (error) {
            console.error('Error getting reserves:', error.message);
            return null;
        }
    }

    async monitorPairCreation() {
        console.log('Starting pair creation monitoring...');
        
        this.factory.on('PairCreated', (token0, token1, pairAddress, pairIndex) => {
            console.log(`New pair created: ${token0}/${token1} at ${pairAddress}`);
            this.knownPairs.set(`${token0}-${token1}`, pairAddress);
        });
    }
}

module.exports = { PairDetector, PAIR_ABI };