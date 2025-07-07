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
const isAdmin = require("../middleware/isadmin");
const isAdminOrSuperAdmin = require("../middleware/isAdminorSuperAdmin");

const uploader = require("../config/upload"); // ✅ multer uploader
const router = express.Router();

// Admin-only route:
router.route("/product")
    .post(isLoggedIn, isAdminOrSuperAdmin, uploader.array("images", 5), createProduct);

module.exports = router;
 // Allows up to 5 images

    router.put("/product/:id", isLoggedIn, isAdminOrSuperAdmin, uploader.array("images", 5), updateProduct);

router.delete("/product/:id", isLoggedIn, isAdminOrSuperAdmin, deleteProduct);

// Public routes:
router.get("/products", getAllProducts);
router.get("/product/:id", getProductById);
router.get("/products/search", searchProducts);

module.exports = router;
