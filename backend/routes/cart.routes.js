const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isloggedin");
const { addToCart, removeFromCart, getCart,placeOrderFromCart, updateCartQuantity } = require("../controllers/cart.controller");

router.post("/add", isLoggedIn, addToCart);
router.delete("/remove/:cartItemId", isLoggedIn, removeFromCart);
router.put('/updatecart', isLoggedIn , updateCartQuantity);
router.get("/getcart", isLoggedIn, getCart);
router.post("/placeorder", isLoggedIn, placeOrderFromCart);

module.exports = router;
