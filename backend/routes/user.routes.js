// routes/user.routes.js
const express = require("express");
const { getAllCustomers, getCustomerByEmail, updateUser } = require("../controllers/user.controller");
const isLoggedIn = require("../middleware/isloggedin");
const isAdmin = require("../middleware/isadmin");
const isAdminOrSuperAdmin = require("../middleware/isAdminorSuperAdmin");

const router = express.Router();



// Admin-only routes:
router.get("/customers",isLoggedIn,isAdminOrSuperAdmin,getAllCustomers);
router.get("/customer/:email",  getCustomerByEmail);

// Route to update a user (only the logged-in user can update their own data)
router.put("/user/:email",isLoggedIn,updateUser);
module.exports = router;
