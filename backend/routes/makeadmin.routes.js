const express = require("express");
const {makeAdmin,demoteAdmin,makeSuperAdmin} = require("../controllers/makeadmin.controller");
const isLoggedIn = require("../middleware/isloggedin");
const isAdmin = require("../middleware/isadmin");


const isSuperAdmin = require("../middleware/isSuperAdmin");

const router = express.Router();

router.post("/make-admin",makeAdmin);
router.post("/make-superadmin",isLoggedIn, isSuperAdmin, makeSuperAdmin);

// Demote Admin to Customer
router.post("/demote-admin",isLoggedIn, isSuperAdmin, demoteAdmin);

module.exports = router;