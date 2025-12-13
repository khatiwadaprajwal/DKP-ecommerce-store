const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Create Redis Client
const redisClient = redis.createClient({

    url: process.env.REDIS_URL 
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;