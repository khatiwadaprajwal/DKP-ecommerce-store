const express = require("express");
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
} = require("../controller/product.controller");

const isLoggedIn = require("../middleware/isloggedin");
const isAdminOrSuperAdmin = require("../middleware/isAdminorSuperAdmin");
const uploader = require("../config/upload"); // ✅ Imports the require-style Multer config

const router = express.Router();

// Protected Routes
router.post(
    "/product", 
    isLoggedIn, 
    isAdminOrSuperAdmin, 
    uploader.array("images", 5), 
    createProduct
);

router.put(
    "/product/:id", 
    isLoggedIn, 
    isAdminOrSuperAdmin, 
    uploader.array("images", 5), 
    updateProduct
);

router.delete(
    "/product/:id", 
    isLoggedIn, 
    isAdminOrSuperAdmin, 
    deleteProduct
);

// Public Routes
router.get("/products/search", searchProducts);
router.get("/products", getAllProducts);
router.get("/product/:id", getProductById);

module.exports = router;