const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const productSchema = new mongoose.Schema({
    
    name:{
        type: String,
        trim: true,
        unique: true,
        required: true,
    },

    description: {
        type: String,
        trim: true,
    },

    price: {
        type: Number,
    },

    category_id: {
        type: ObjectId,
        ref: "Category"
    },

    restaurant_id: {
        type: ObjectId,
        ref: "Restaurant"
    },

    isAvailable: {
        type: Boolean,
        default: true,
    },

    product_image: {
        fileName: { type: String },
        filePath: { type: String }
    },

    sku: {
        type: String,
        unique: true,
        required: true,
    },

    stock_item: {
        type: Number
    },

    discount: {
        type: Number,
    },

    product_description: {
        type: String,
    },

    status: {
        type: String,
        enum: ["Available", "Not_Available"]
    },

    original_price: {
        type: Number,
    },

    isTaxable: {
        type: Boolean
    }

},{timestamps: true});

module.exports = mongoose.model("Product", productSchema);