const express = require("express");
const { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct 
} = require("../controller/product.controller");
const isLoggedIn = require("../middleware/isloggedin");
const isAdmin = require("../middleware/isadmin");
const uploader = require("../middleware/multer")
const router = express.Router();

// Admin-only routes:
router.route("/product")
    .post(isLoggedIn, isAdmin, uploader.array("images", 5), createProduct); // Allows up to 5 images

router.put("/product/:id", isLoggedIn, isAdmin, updateProduct);
router.delete("/product/:id", isLoggedIn, isAdmin, deleteProduct);

// Public routes:
router.get("/products", getAllProducts);
router.get("/product/:id", getProductById);

module.exports = router;
