const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const passwordRoutes = require('./password.routes');
const makeadminRoutes = require('./makeadmin.routes');
const userreviewRoutes = require('./userreview.routes');
const sendmsgRoutes = require('./sendmsg.routes');
const productlistRoutes = require('./productlist.routes');

router.use('/auth', authRoutes);
router.use('/', userRoutes);
router.use('/', productRoutes);
router.use('/', cartRoutes);
router.use('/', orderRoutes);
router.use('/', passwordRoutes);
router.use('/', makeadminRoutes);
router.use('/', userreviewRoutes);
router.use('/', sendmsgRoutes);
router.use('/productlist', productlistRoutes);

module.exports = router;