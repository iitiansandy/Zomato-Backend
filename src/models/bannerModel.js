const mongoose = require('mongoose');

const bannerImageSchema = new mongoose.Schema({
    bannerImages: [
        {
            fileName: { type: String, default: "" },
            filePath: { type: String, default: "" }
        }
    ]
}, { timestamps: true });


module.exports = mongoose.model("BannerImage", bannerImageSchema);