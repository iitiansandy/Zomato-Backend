const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        trim: true,
    },

    password: {
        type: String,
    },

    mobile: {
        type: String,
        unique: true,
    },

    role: {
        type: String,
        enum: ["SUPER_ADMIN", "ADMIN"]
    },

    isSuperAdmin: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true});

module.exports = mongoose.model("Admin", adminSchema);