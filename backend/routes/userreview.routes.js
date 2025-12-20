const express = require("express");
const { addReview, getProductReviews, getUserReviews, updateReview, deleteReview, } = require("../controllers/userreview.controller");

const isLoggedIn = require("../middleware/isloggedin");
const isAdmin = require("../middleware/isadmin");

const router = express.Router();

router.post("/addreview", isLoggedIn, addReview);
router.get("/review/:productId", getProductReviews);
router.get("/userreview", isLoggedIn, getUserReviews);
router.put("/updatereview/:reviewId", isLoggedIn, updateReview);
router.delete("/delete/:reviewId", isLoggedIn, deleteReview);

module.exports = router;
