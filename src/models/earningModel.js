const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const earningSchema = new mongoose.Schema({
    riderId: {
        type: ObjectId,
        ref: "Rider",
    },

    orderId: {
        type: ObjectId,
        ref: "Order",
    },

    deliveryId: {
        type: ObjectId,
        ref: "Delivery"
    },

    earning_amount: {
        type: Number,
    }
},{timestamps: true});

module.exports = mongoose.model("Earning", earningSchema);