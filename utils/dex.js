const { ethers } = require('ethers');

// Common DEX addresses
const DEX_ADDRESSES = {
    UNISWAP_V2_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    UNISWAP_V2_FACTORY: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    SUSHISWAP_ROUTER: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    SUSHISWAP_FACTORY: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
};

// Uniswap V2 Router ABI (minimal)
const UNISWAP_V2_ROUTER_ABI = [
    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function approve(address spender, uint256 amount) returns (bool)'
];

class DexUtils {
    constructor(provider) {
        this.provider = provider;
        this.uniswapRouter = new ethers.Contract(
            DEX_ADDRESSES.UNISWAP_V2_ROUTER,
            UNISWAP_V2_ROUTER_ABI,
            provider
        );
    }

    async getTokenPrice(tokenAddress, amountIn = '1') {
        try {
            const path = [tokenAddress, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2']; // to WETH
            const amounts = await this.uniswapRouter.getAmountsOut(
                ethers.utils.parseEther(amountIn),
                path
            );
            return ethers.utils.formatEther(amounts[1]);
        } catch (error) {
            console.error(`Failed to get price for ${tokenAddress}:`, error.message);
            return null;
        }
    }

    async checkArbitrageOpportunity(tokenA, tokenB, amountIn) {
        // TODO: Implement cross-DEX arbitrage checking
        console.log(`Checking arbitrage for ${tokenA} -> ${tokenB}`);
        return false;
    }
}

module.exports = { DexUtils, DEX_ADDRESSES, ERC20_ABI };