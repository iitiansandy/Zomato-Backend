const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const restaurantSchema = new mongoose.Schema({
    
    restaurant_Id: {
        type: String,
        unique: true,
    },

    name: {
        type: String,
        trim: true,
    },

    description: {
        type: String,
        trim: true,
    },

    address: {
        type: String,
        trim: true,
    },

    city: {
        type: String,
    },

    state: {
        type: String,
    },

    country: {
        type: String,
    },

    postal_code: {
        type: String,
    },

    phone: {
        type: String,
    },

    email: {
        type: String,
        unique: true,
    },

    website: {
        type: String,
    },

    banners: [
        {
            fileName: { type: String},
            filePath: { type: String},
        }
    ],

    opening_hours: {
        type: String,
    },

    cuisine_type: {
        type: String,
        enum: ["Veg", "Non-Veg", "All"]
    },

    rating: {
        type: Number,
    },

    isOpen: {
        type: Boolean,
        default: true,
    },

    seating_capacity: {
        type: Number,
    },

    coordinates: {
        latitude: {
            type: Number,
            default: 0,
        },
    
        longitude: {
            type: Number,
            default: 0,
        },
    },

    FCM_Token: {
        type: String,
    },

    slug: {
        type: String,
        unique: true,
    },

    seo_keywords: [String],

    seo_description: {
        type: String,
        trim: true,
    },

    meta_title: {
        type: String,
        trim: true,
    },

    meta_description: {
        type: String,
        trim: true,
    },

    meta_keywords: [String],
}, {timestamps: true});


module.exports = mongoose.model("Restaurant", restaurantSchema);