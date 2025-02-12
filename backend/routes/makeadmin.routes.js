const express = require("express");
const makeAdmin = require("../controller/makeadmin.controller");
const isLoggedIn = require("../middleware/isloggedin");
const isAdmin = require("../middleware/isadmin");
const router = express.Router();
router.put("/make-admin", isLoggedIn, isAdmin, makeAdmin);

module.exports = router;