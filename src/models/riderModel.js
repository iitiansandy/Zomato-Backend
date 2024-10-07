const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const riderSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
    },

    fullName: {
        type: String,
        trim: true,
    },

    email: {
        type: String,
        trim: true,
        required: true,
    },

    password: {
        type: String,
        trim: true,
    },

    mobile: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },

    profilePic: {
        fileName: { type: String },
        filePath: { type: String }
    },

    address: {
        type: String,
        trim: true,
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

    vehicle_type: {
        type: String,
        enum: ["Two_Wheeler", "Four_Wheeler"]
    },

    vehicle_number: {
        type: String,
        trim: true,
    },

    FCM_Token: {
        type: String,
    }
},{timestamps: true});

module.exports = mongoose.model("Rider", riderSchema);