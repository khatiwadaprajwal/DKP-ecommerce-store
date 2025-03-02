const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isloggedin");
const { addToCart, removeFromCart, getCart } = require("../controller/cart.controller");

router.post("/add", isLoggedIn, addToCart);
router.delete("/remove/:productId", isLoggedIn, removeFromCart);
router.get("/getcart", isLoggedIn, getCart);
//router.post("/placeorder", isLoggedIn, placeOrderFromCart);

module.exports = router;
