const Product = require("../model/productmodel");
const mongoose = require('mongoose');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { productName, description, category, price, gender, variants, totalSold } = req.body;

        // Handle file uploads (if any)
        let imagePaths = req.files ? req.files.map(file => file.filename) : [];

        // Parse variants safely (handle both string and object)
        const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

        // Calculate total quantity from parsedVariants
        const totalQuantity = parsedVariants.reduce((acc, curr) => acc + curr.quantity, 0);

        const newProduct = new Product({
            productName,
            description,
            category,
            price,
            gender,
            images: imagePaths,
            variants: parsedVariants,
            totalQuantity,
            totalSold
        });

        await newProduct.save();

        return res.status(201).json({
            message: "Product created successfully",
            product: newProduct,
            imageUrls: newProduct.images.map(img => `${req.protocol}://${req.get("host")}/public/${img}`)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error creating product",
            error: error.message
        });
    }
};



// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ products });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving products", error: error.message });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ product });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving product", error: error.message });
    }
};

// Update a product by ID


exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, description, category, price, gender, variants, totalSold } = req.body;

        // Check if ID is a valid ObjectId before proceeding
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        let imagePaths = req.files ? req.files.map(file => file.filename) : undefined;

        // Check if variants is a string and parse it, otherwise use it directly as an array
        const parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);

        // Calculate total quantity from parsedVariants
        const totalQuantity = parsedVariants.reduce((acc, curr) => acc + curr.quantity, 0);

        let updateData = {
            productName,
            description,
            category,
            price,
            gender,
            variants: parsedVariants,
            totalQuantity,
            totalSold
        };

        if (imagePaths) {
            updateData.images = imagePaths;
        }

        // Update the product by its ObjectId
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        return res.status(500).json({ message: "Error updating product", error: error.message });
    }
};



// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

// Search products with fuzzy matching
exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Create text index if it doesn't exist
        await Product.collection.createIndex({
            productName: "text",
            description: "text",
            category: "text",
            gender: "text"
        });

        // Perform fuzzy search using MongoDB's text search
        const products = await Product.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(50);

        return res.status(200).json({ 
            products,
            total: products.length
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Error searching products", 
            error: error.message 
        });
    }
};
