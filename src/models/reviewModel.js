const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const reviewSchema = new mongoose.Schema({
    customerId: {
        type: ObjectId,
        ref: "Customer",
    },

    restaurantId: {
        type: ObjectId,
        ref: "Restaurant",
    },

    orderId: {
        type: ObjectId,
        ref: "Order"
    },

    rating: {
        type: Number,
    },

    comment: {
        type: String
    },

    isApproved: {
        type: Boolean,
        default: false,
    },

    helpful_count: {
        type: Number,
    }
},{timestamps: true});

module.exports = mongoose.model("Review", reviewSchema);