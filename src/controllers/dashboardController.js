const categoryModel = require("../models/categoryModel");
const bannerImageModel = require("../models/bannerModel");
const { getCurrentIPAddress } = require("../uitls/utils");
const { StatusCodes } = require("http-status-codes");


const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { port, adminSecretKey } = require("../config/config");
const { isValidObjectId } = require("mongoose");
// const userModel = require("../models/userModel");
const orderModel = require('../models/orderModel');
const { ErrorResponse, SuccessResponse } = require("../uitls/common");


let bannerFolder = path.join(__dirname, "..", "..", "banners");


// GET DASHBOARD
const getDashboard = async (req, res) => {
    try {
        let { userId } = req.params;

        let myOrders
        if (userId) {
            myOrders = await orderModel.find({ customer_id: userId });
        };

        let categories = await categoryModel.find({});
        let bannerObj = await bannerImageModel.findOne();
        let banners = bannerObj.bannerImages;
        return res.status(200).send({
            status: true,
            message: "Success",
            categoryList: categories,
            bannerImages: banners,
            myOrders,
        });
    } catch (error) {
        console.log(error);
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


// ADD UPDATE BANNER IMAGES
const addUpdateBanners = async (req, res) => {
    try {
        let { key } = req.params;
        if (!key) {
            return res.status(400).send({
                status: false,
                message: 'key is required'
            });
        };

        if (key !== adminSecretKey) {
            return res.status(403).send({ status: false, message: "NOT AUTHORIZED!!!" });
        };

        let bannerObj = await bannerImageModel.findOne();
        if (!bannerObj) {
            bannerObj = await bannerImageModel.create({ bannerImages: [] });
        };

        let { ImageModel } = req.body;

        let parsedData = JSON.parse(ImageModel);

        let bannerImage = req.files.bannerImage;

        if (!bannerImage) {
            return res.status(400).send({ status: false, message: "No banner image uploaded" });
        };

        if (!fs.existsSync(bannerFolder)) {
            fs.mkdirSync(bannerFolder);
        };

        let index = parsedData.index; //{"isNewPick":false,"index":1,"img_id":"64ffebc1f3bfc5d77220193b","imageName":"1694493633669-432139964.jpg"}
        let img_id = parsedData.img_id ? parsedData.img_id : "";
        let imageName = parsedData.imageName;
        let isNewPick = parsedData.isNewPick;

        let currentIpAddress = getCurrentIPAddress();
        let imgRelativePath = "/banners/";
        let imgUniqName = uuid.v4() + "." + bannerImage.name.split(".").pop();
        let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
        let imgSavingPath = path.join(bannerFolder, imgUniqName);

        if (!isNewPick) {
            let oldImage = bannerObj.bannerImages[index].imageName;
            if (oldImage) {
                let oldImgPath = path.join(bannerFolder, oldImage);
                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                }
            };
            
            await bannerImage.mv(imgSavingPath);

            let updatedBannerObj = {
                imageName: imgUniqName,
                imagePath: imgFullUrl,
            };

            bannerObj.bannerImages[index] = updatedBannerObj;

            await bannerObj.save();

            let bannerImages = bannerObj.bannerImages;

            return res.status(200).send({
                status: true,
                message: "Banner updated successfully",
                data: bannerImages,
            });
        } else {
            await bannerImage.mv(imgSavingPath);

            let newBannerObj = {
                imageName: imgUniqName,
                imagePath: imgFullUrl,
            };

            bannerObj.bannerImages.push(newBannerObj);

            await bannerObj.save();

            let bannerImages = bannerObj.bannerImages;

            return res.status(200).send({
                status: true,
                message: "Banner added successfully",
                data: bannerImages,
            });
        };
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


// DELETE BANNER IMAGES
const deleteBannerImage = async (req, res) => {
    try {
        let { key, imgId } = req.params;
        if (!key || !imgId) {
            return res.status(400).send({
                status: false,
                message: "key and imgId are required"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(403).send({ status: false, message: "NOT AUTHORIZED!!!" });
        };

        let bannerObj = await bannerImageModel.findOne();

        if (!bannerObj) {
            return res.status(400).send({ status: false, message: "Not Found!!!" });
        };

        if (bannerObj.bannerImages.length) {
            for (let i=0; i<bannerObj.bannerImages.length; i++) {
                if ( imgId === bannerObj.bannerImages[i]._id.toString() ) {
                    let oldImage = bannerObj.bannerImages[i].imageName;
                    if (oldImage) {
                        let oldImgPath = path.join(bannerFolder, oldImage);
                        if (fs.existsSync(oldImgPath)) {
                            fs.unlinkSync(oldImgPath);
                        };
                    };

                    let arr = bannerObj.bannerImages;
                    arr.splice(i, 1);
                    bannerObj.bannerImages = arr;
                    await bannerObj.save();
                }
            }
        };

        let bannerImages = bannerObj.bannerImages;

        return res.status(200).send({
            status: true,
            message: "Banner image deleted successfully",
            data: bannerImages,
        });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


module.exports = {
    getDashboard,
    addUpdateBanners,
    deleteBannerImage
}