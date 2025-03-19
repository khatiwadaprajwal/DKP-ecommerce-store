const Product = require("../model/productmodel");

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { productName, description, category, price, images, gender, size, color, totalQuantity, totalSold } = req.body;
        let imagePaths = req.files ? req.files.map(file => file.filename) : undefined;
        const newProduct = new Product({ productName, description, category, price, images, gender, size, color, totalQuantity, totalSold, createdAt: new Date() });
        if (imagePaths) {
            newProduct.images = imagePaths;
        }
        await newProduct.save();
        return res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        return res.status(500).json({ message: "Error creating product", error: error.message });
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
        const { productName, description, category, price, gender, size, color, totalQuantity, totalSold } = req.body;

        // Check if files were uploaded
        let imagePaths = req.files ? req.files.map(file => file.filename) : undefined;

        // Prepare update data
        let updateData = { productName, description, category, price, gender, size, color, totalQuantity, totalSold };

        // If new images are uploaded, update images field
        if (imagePaths) {
            updateData.images = imagePaths;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product updated successfully", product });

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
