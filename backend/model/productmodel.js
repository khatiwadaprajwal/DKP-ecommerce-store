const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    gender: { type: String, enum: ["Men", "Women", "Kids", "Male", "Female"], required: true },

    variants: [
        {
            color: { type: String, required: true },
            size: { type: String, required: true },
            quantity: { type: Number, required: true }
        }
    ],

    totalQuantity: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
}, {
    timestamps: true,
    autoIndex: true,
    autoCreate: true
});

module.exports = mongoose.model('Product', productSchema);
