const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
    },

    description: {
        type: String,
    },

    category_image: {
        fileName: { type: String },
        filePath: { type: String }
    },
}, {timestamps: true});

module.exports = mongoose.model("Category", categorySchema);