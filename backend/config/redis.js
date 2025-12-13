// const redis = require('redis');
// const dotenv = require('dotenv');

// dotenv.config();

// // Create Redis Client
// const redisClient = redis.createClient({

//     url: process.env.REDIS_URL 
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// redisClient.on('connect', () => console.log('Redis Client Connected'));

// (async () => {
//     await redisClient.connect();
// })();

// module.exports = redisClient;
const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Create Redis Client with robust connection settings
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        connectTimeout: 10000, // Wait 10 seconds before erroring (default is 5s)
        reconnectStrategy: (retries) => {
            // Wait longer between retries (max 3 seconds)
            console.log(`Retrying Redis connection... Attempt: ${retries}`);
            return Math.min(retries * 50, 3000);
        }
    }
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('✅ Redis Client Connected'));
redisClient.on('reconnecting', () => console.log('⏳ Redis Client Reconnecting...'));

// Connect immediately
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Failed to connect to Redis initially:", err.message);
    }
})();

// Handle cleanup when you restart the server (nodemon)
process.on('SIGINT', async () => {
    await redisClient.quit();
    process.exit(0);
});

module.exports = redisClient;