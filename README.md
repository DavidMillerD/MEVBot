# MEV Bot

A Node.js based MEV (Maximal Extractable Value) bot for Ethereum that monitors the mempool and identifies arbitrage opportunities across DEXs.

## Features

- Real-time mempool monitoring via WebSocket
- DEX integration (Uniswap V2, SushiSwap)
- Transaction analysis and MEV opportunity detection  
- Pair monitoring for new liquidity pools
- Configurable profit thresholds and gas limits

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
- Ethereum RPC URL (Infura/Alchemy)
- WebSocket URL for mempool monitoring
- Private key for transactions
- Profit thresholds

4. Run the bot:
```bash
npm start
```

## Configuration

Key settings in `.env`:

- `MIN_PROFIT_ETH`: Minimum profit threshold in ETH
- `MAX_GAS_PRICE_GWEI`: Maximum gas price to pay
- `ETHEREUM_RPC_URL`: HTTP RPC endpoint
- `ETHEREUM_WSS_URL`: WebSocket endpoint for mempool

## Architecture

- `index.js` - Main bot entry point
- `config.js` - Configuration management
- `utils/dex.js` - DEX interaction utilities
- `utils/pairs.js` - Uniswap pair monitoring
- `utils/mempool.js` - Mempool transaction monitoring
- `utils/analyzer.js` - Transaction analysis and MEV detection

## Disclaimer

This is for educational purposes only. MEV extraction can be risky and may result in financial losses. Use at your own risk.