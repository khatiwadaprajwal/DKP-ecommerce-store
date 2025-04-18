const express = require("express");
const {makeAdmin,demoteAdmin,makeSuperAdmin} = require("../controller/makeadmin.controller");
const isLoggedIn = require("../middleware/isloggedin");


const isSuperAdmin = require("../middleware/isSuperAdmin");

const router = express.Router();

router.post("/make-admin", isLoggedIn, isSuperAdmin, makeAdmin);
router.post("/make-superadmin",isLoggedIn, isSuperAdmin, makeSuperAdmin);

// Demote Admin to Customer
router.post("/demote-admin",isLoggedIn, isSuperAdmin, demoteAdmin);

module.exports = router;