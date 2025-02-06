// ProductModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    weight: Number,
    price: Number,
   
});

module.exports = mongoose.model('Product', productSchema);
