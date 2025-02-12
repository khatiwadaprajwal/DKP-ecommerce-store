const express = require("express")
const app = express()

const auth_routes=require("./auth.routes")
const product_routes = require("./product.routes")
const admin_routes=require("./makeadmin.routes")
const forgotpassword_routes=require("./forgotpass.routes")
const user_routes=require("./user.routes");


app.use("/",forgotpassword_routes)
app.use("/",admin_routes)
app.use("/",product_routes)
app.use('/auth', auth_routes);
app.use("/",user_routes);
app.use("/",admin_routes);

module.exports = app