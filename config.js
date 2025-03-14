require('dotenv').config();

const config = {
    ethereum: {
        rpcUrl: process.env.ETHEREUM_RPC_URL,
        wssUrl: process.env.ETHEREUM_WSS_URL,
        privateKey: process.env.PRIVATE_KEY
    },
    
    bot: {
        minProfitEth: parseFloat(process.env.MIN_PROFIT_ETH) || 0.01,
        maxGasPriceGwei: parseInt(process.env.MAX_GAS_PRICE_GWEI) || 50
    },
    
    notifications: {
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
        telegramChatId: process.env.TELEGRAM_CHAT_ID
    }
};

function validateConfig() {
    if (!config.ethereum.rpcUrl) {
        throw new Error('ETHEREUM_RPC_URL is required');
    }
    
    console.log('Configuration loaded successfully');
    console.log(`Min profit threshold: ${config.bot.minProfitEth} ETH`);
    console.log(`Max gas price: ${config.bot.maxGasPriceGwei} gwei`);
}

module.exports = { config, validateConfig };