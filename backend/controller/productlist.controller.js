const Product = require('../model/productmodel');
const UserReview = require('../model/userreview.model');

// Sentiment analysis helper function
const analyzeSentiment = (reviewText) => {

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
        // Get all products with their reviews
        const products = await Product.find();
        const productScores = [];

        for (const product of products) {
            const reviews = await UserReview.find({ productId: product._id });
            
            // Calculate sentiment score
            let sentimentScore = 0;
            reviews.forEach(review => {
                sentimentScore += analyzeSentiment(review.reviewText);
            });
            
            // Calculate total score based on sales, ratings, and sentiment
            const totalScore = (
                (product.totalSold * 0.4) + // 40% weight to sales
                (product.averageRating * 0.3) + // 30% weight to ratings
                (sentimentScore * 0.3) // 30% weight to sentiment
            );
            
            productScores.push({
                product,
                totalScore
            });
        }

        // Sort by total score and get top 8 products
        const bestsellers = productScores
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 8)
            .map(item => item.product);

        res.status(200).json({
            success: true,
            bestsellers
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
        // Featured products are selected based on:
        // 1. High average rating (>= 4)
        // 2. Good stock availability
        // 3. Recent sales activity
        const featuredProducts = await Product.find({
            averageRating: { $gte: 4 },
            
        })
        .sort({  averageRating: -1 })
        .limit(8);

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
        const latestProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(8);

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
        // Get products with their average ratings and review counts
        const products = await Product.find()
            .sort({ averageRating: -1 })
            .limit(8);

        // Get detailed review information for each product
        const topRatedProducts = await Promise.all(
            products.map(async (product) => {
                const reviews = await UserReview.find({ productId: product._id });
                const reviewCount = reviews.length;
                
                return {
                    ...product.toObject(),
                    reviewCount,
                    reviews: reviews.slice(0, 3) // Include top 3 reviews
                };
            })
        );

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