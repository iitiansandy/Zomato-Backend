const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    customerNote: {
        type: String,
    },

    riderNote: {
        type: String
    },

    customer_id: {
        type: ObjectId,
        ref: "Customer"
    },

    restaurant_id: {
        type: ObjectId,
        ref: "Restaurant"
    },

    rider_id: {
        type: ObjectId,
        ref: "Rider"
    },

    order_items: [
        {
            itemId: { type: String },
            item_name: { type: String, default: "" },
            quantity: { type: Number, default: 1 },
            one_qty_price: { type: Number },
            total_price: { type: Number },
            isTaxable: { type: Boolean },
            imgUrl: { type: String, default: "" },
            isVeg: { type: Boolean },
            order_date: { type: String }
        }
    ],

    total_items: {
        type: Number,
    },

    total: {
        type: Number
    },

    tax: {
        type: Number,
        default: 0
    },

    grand_total: {
        type: Number
    },

    delivery_address: {
        type: String,
    },

    delivery_time: {
        type: String,
    },

    status: {
        type: String,
        enum: ["Pending", "Completed", "Cancelled"]
    }
},{timestamps: true});

module.exports = mongoose.model("Order", orderSchema);