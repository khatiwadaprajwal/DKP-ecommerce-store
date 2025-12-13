const Product = require('../model/productmodel');
const UserReview = require('../model/userreview.model');
const redisClient = require('../config/redis'); // Import Redis Client

// Helper: Define Cache Expiration Time (in seconds)
// 3600 = 1 hour. Adjust based on how often your data changes.
const CACHE_TTL = 3600; 

// Sentiment analysis helper function
const analyzeSentiment = (reviewText) => {
    if (!reviewText) return 0; // Handle empty reviews
    const positiveWords = ['excellent', 'amazing', 'great', 'good', 'love', 'perfect', 'best', 'awesome', 'fantastic', 'wonderful'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'worst', 'disappointing', 'horrible', 'useless', 'waste', 'regret'];
    
    const words = reviewText.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) score += 1;
        if (negativeWords.includes(word)) score -= 1;
    });
    
    return score;
};

// Get bestseller products
exports.getBestsellerProducts = async (req, res) => {
    try {
        const cacheKey = 'products:bestsellers';

        // 1. Check Redis Cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                bestsellers: JSON.parse(cachedData),
                source: 'cache' // Optional: for debugging
            });
        }

        // 2. If not in cache, perform the heavy logic
        const products = await Product.find();
        const productScores = [];

        for (const product of products) {
            const reviews = await UserReview.find({ productId: product._id });
            
            let sentimentScore = 0;
            reviews.forEach(review => {
                sentimentScore += analyzeSentiment(review.reviewText);
            });
            
            const totalScore = (
                (product.totalSold * 0.4) + 
                (product.averageRating * 0.3) + 
                (sentimentScore * 0.3)
            );
            
            productScores.push({
                product,
                totalScore
            });
        }

        const bestsellers = productScores
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 8)
            .map(item => item.product);

        // 3. Save result to Redis
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(bestsellers));

        res.status(200).json({
            success: true,
            bestsellers,
            source: 'db'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching bestseller products",
            error: error.message
        });
    }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
    try {
        const cacheKey = 'products:featured';

        // 1. Check Redis
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                featuredProducts: JSON.parse(cachedData)
            });
        }

        // 2. DB Query
        const featuredProducts = await Product.find({
            averageRating: { $gte: 4 },
        })
        .sort({ averageRating: -1 })
        .limit(8);

        // 3. Save to Redis
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(featuredProducts));

        res.status(200).json({
            success: true,
            featuredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured products",
            error: error.message
        });
    }
};

// Get latest products
exports.getLatestProducts = async (req, res) => {
    try {
        const cacheKey = 'products:latest';

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                latestProducts: JSON.parse(cachedData)
            });
        }

        const latestProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(8);

        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(latestProducts));

        res.status(200).json({
            success: true,
            latestProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching latest products",
            error: error.message
        });
    }
};

// Get top rated products
exports.getTopRatedProducts = async (req, res) => {
    try {
        const cacheKey = 'products:toprated';

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                topRatedProducts: JSON.parse(cachedData)
            });
        }

        const products = await Product.find()
            .sort({ averageRating: -1 })
            .limit(8);

        const topRatedProducts = await Promise.all(
            products.map(async (product) => {
                const reviews = await UserReview.find({ productId: product._id });
                const reviewCount = reviews.length;
                
                return {
                    ...product.toObject(), // Convert Mongoose doc to plain object
                    reviewCount,
                    reviews: reviews.slice(0, 3) 
                };
            })
        );

        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(topRatedProducts));

        res.status(200).json({
            success: true,
            topRatedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching top rated products",
            error: error.message
        });
    }
};