// ProductController.js
const Product = require('../model/productmodel');

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
   
};

module.exports = productController;
