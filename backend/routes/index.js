const express = require("express")
const app = express()


const product_routes = require("./product.routes")



app.use("/",product_routes)


module.exports = app