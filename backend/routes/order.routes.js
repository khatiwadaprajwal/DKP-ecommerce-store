const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isloggedin");
const isadmin = require("../middleware/isadmin");
const isSuperAdmin = require("../middleware/isSuperAdmin");
const {
  createOrder,
  paypalSuccess,
  cancelOrder,
  getOrders,
  getAllOrders,
  changeOrderStatus,
} = require("../controller/order.controller");
const isAdminOrSuperAdmin = require("../middleware/isAdminorSuperAdmin");

// Route to place an order (COD & PayPal)
router.post("/place", isLoggedIn, createOrder);

// Route for PayPal payment success
router.get("/paypal/success", paypalSuccess);

// Route to cancel an order
router.delete("/cancel/:orderId", isLoggedIn, cancelOrder);

// Route to get all orders for the logged-in user
router.get("/myorders", isLoggedIn, getOrders);
router.get("/getallorder", isLoggedIn, isAdminOrSuperAdmin, getAllOrders);
router.put(
  "/change-status/:orderId",
  isLoggedIn,
  isAdminOrSuperAdmin,
  changeOrderStatus
);

module.exports = router;
