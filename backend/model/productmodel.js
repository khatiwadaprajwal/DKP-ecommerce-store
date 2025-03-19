// ProductModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    gender: { type: String, enum: ["Men", "Women", "Kids"], required: true },
    size: [{ type: String, required: true }],
    color: [{ type: String, required: true }],
    totalQuantity: { type: Number, required: true },
    totalSold: { type: Number, required: true },
    averageRating: { type: Number, default: 0 }
},
    {

        timestamps: true,
        autoIndex: true,
        autoCreate: true



    });

module.exports = mongoose.model('Product', productSchema);
