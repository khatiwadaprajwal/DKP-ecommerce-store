const Product = require("../model/productmodel");
const mongoose = require('mongoose');
const cloudinary = require("../config/cloudnary"); // ✅ Using the fixed require file
const fs = require("fs"); // ✅ Needed to delete local files

// ==========================================
// 1. CREATE PRODUCT
// ==========================================
exports.createProduct = async (req, res) => {
    try {
        const { productName, description, category, price, gender, variants, totalSold } = req.body;

        // ✅ Step 1: Handle Cloudinary Uploads
        let imageUrls = [];
        
        // If files exist, upload them to Cloudinary
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    // Upload to Cloudinary
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "ecommerce_products",
                        resource_type: "image"
                    });
                    
                    // Save the Secure URL
                    imageUrls.push(result.secure_url);

                    // 🗑️ Delete local file after upload
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                } catch (uploadError) {
                    console.error("Cloudinary Error:", uploadError);
                    // Try to delete local file if upload fails
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                }
            }
        }

        // ✅ Step 2: Parse Variants (Your Old Logic)
        const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

        // ✅ Step 3: Calculate Quantity (Your Old Logic)
        const totalQuantity = Array.isArray(parsedVariants) 
            ? parsedVariants.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0)
            : 0;

        // ✅ Step 4: Save to DB
        const newProduct = new Product({
            productName,
            description,
            category,
            price,
            gender,
            images: imageUrls, // Saving Cloudinary URLs, not local paths
            variants: parsedVariants,
            totalQuantity,
            totalSold: totalSold || 0
        });

        await newProduct.save();

        return res.status(201).json({
            message: "Product created successfully",
            product: newProduct,
            imageUrls: imageUrls 
        });

    } catch (error) {
        // Cleanup files if main logic crashes
        if (req.files) {
            req.files.forEach(f => {
                if(fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
        return res.status(500).json({
            message: "Error creating product",
            error: error.message
        });
    }
};

// ==========================================
// 2. UPDATE PRODUCT
// ==========================================
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, description, category, price, gender, variants, totalSold } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // ✅ Handle New Images (Cloudinary)
        let newImageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "ecommerce_products",
                        resource_type: "image"
                    });
                    newImageUrls.push(result.secure_url);
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                } catch (err) {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                }
            }
        }

        // Parse Variants (Your Old Logic)
        let parsedVariants;
        try {
            parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);
        } catch (e) {
            parsedVariants = []; 
        }

        // Calculate Quantity (Your Old Logic)
        const totalQuantity = parsedVariants.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0);

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

        // Only update images if new ones were provided
        if (newImageUrls.length > 0) {
            updateData.images = newImageUrls;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        if (req.files) {
            req.files.forEach(f => { if(fs.existsSync(f.path)) fs.unlinkSync(f.path); });
        }
        return res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

// ==========================================
// 3. OTHER CONTROLLERS (Your Old Code - Unchanged)
// ==========================================

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ products });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving products", error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json({ product });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving product", error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Search query is required" });

        try { await Product.collection.createIndex({ productName: "text", description: "text", category: "text", gender: "text" }); } catch (e) {}

        const products = await Product.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(50);

        return res.status(200).json({ products, total: products.length });
    } catch (error) {
        return res.status(500).json({ message: "Error searching products", error: error.message });
    }
};