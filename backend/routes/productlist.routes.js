const express = require('express');
const router = express.Router();
const {
    getBestsellerProducts,
    getFeaturedProducts,
    getLatestProducts,
    getTopRatedProducts
} = require('../controllers/productlist.controller');

// Get bestseller products
router.get('/bestsellers', getBestsellerProducts);

// Get featured products
router.get('/featured', getFeaturedProducts);

// Get latest products
router.get('/latest', getLatestProducts);

// Get top rated products
router.get('/top-rated', getTopRatedProducts);

module.exports = router; 