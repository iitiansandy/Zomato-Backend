const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const deliverySchema = new mongoose.Schema({
    oderId: {
        type: ObjectId,
        ref: "Order",
    },

    riderId: {
        type: ObjectId,
        ref: "Rider",
    },

    status: {
        type: String,
        enum: ["Ongoing", "Completed"]
    },

    delivery_time: {
        type: String,
    },
},{timestamps: true});

module.exports = mongoose.model("Delivery", deliverySchema);