const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;


const customerSchema = new mongoose.Schema({
    userId: {
        type: String,
        trim: true,
        unique: true,
    },

    name: {
        type: String,
        trim: true,
        required: true,
    },

    pronoun: {
        type: String,
        trim: true,
    },

    email: {
        type: String,
        trim: true,
        unique: true,
    },

    password: {
        type: String,
        trim: true,
    },

    mobile: {
        type: String,
        trim: true,
        unique: true,
    },

    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"]
    },

    sessionToken: {
        type: String,
        trim: true,
    },

    countryCode: {
        type: String,
        trim: true,
    },

    code: {
        type: String,
        trim: true,
    },

    loginType: {
        type: String,
        enum: ["PHONE", "EMAIL"]
    },

    profilePic: {
        fileName: {
            type: String,
            trim: true,
        },

        filePath: {
            type: String,
            trim: true,
        }
    },

    isNewUser: {
        type: Boolean,
        default: true,
    },

    isVerifiedUser: {
        type: Boolean,
        default: false
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

    address: {
        type: String,
    },

    FCM_Token: {
        type: String,
    }
},{timestamps: true});

module.exports = mongoose.model("Customer", customerSchema);