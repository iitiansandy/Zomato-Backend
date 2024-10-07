const riderModel = require('../models/riderModel');
let { getCurrentIPAddress } = require("../uitls/utils");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcrypt');
const { StatusCodes } = require("http-status-codes");
const { port } = require("../config/config");
// const restaurantModel = require("../models/restaurantModel");
const { isValidObjectId } = require("mongoose");

const { ErrorResponse, SuccessResponse } = require("../uitls/common");


let riderImgFolder = path.join(__dirname, "..", "riders");

// ADD RIDER
const addRider = async (req, res) => {
    try {
        let {
            userName,
            fullName,
            email,
            password,
            mobile
        } = req.body;

        let hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;

        let imgObj = { fileName: "", filePath: "" };
        if ("profilePic" in req.body || (req.files && req.files.profilePic)) {
            let { profilePic } = req.files;
            if (!profilePic) {
                return res.status(400).send({
                    status: false,
                    message: 'No profilePic uploaded'
                })
            };

            if (!fs.existsSync(riderImgFolder)) {
                fs.mkdirSync(riderImgFolder);
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/riders/";
            let imgUniqName = uuid.v4() + "." + profilePic.name.split(".").pop();
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(riderImgFolder, imgUniqName);

            await profilePic.mv(imgSavingPath);

            imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl
            }
        };

        let riderData = {
            userName,
            fullName,
            email,
            password,
            mobile,
            profilePic: imgObj
        };
        let newRider = await riderModel.create(riderData);
        SuccessResponse.data = newRider;
        return res.status(StatusCodes.CREATED).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
    }
};


// GET RIDER BY ID
const getRider = async (req, res) => {
    try {
        let { riderId } = req.params;
        if (!riderId) {
            ErrorResponse.message = "rider Id is required";
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
        };

        let r = await riderModel.findById(riderId);
        if (!r) {
            ErrorResponse.message = "rider not found";
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
        };

        SuccessResponse.data = r;
        return res.status(StatusCodes.CREATED).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
    }
};


// GET ALL RIDERS
const getAllRiders = async (req, res) => {
    try {
        let allRiders = await riderModel.find({});
        SuccessResponse.data = allRiders;
        return res.status(StatusCodes.CREATED).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
    }
};


// UPDATE RIDER
const updateRider = async (req, res) => {
    try {
        let { riderId } = req.params;
        if (!riderId) {
            ErrorResponse.message = "rider Id is required";
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
        };

        let r = await riderModel.findById(riderId);
        if (!r) {
            ErrorResponse.message = "rider not found";
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
        };

        let e = req.body;

        if ("userName" in e) {
            r.userName = e.userName;
        };

        if ("fullName" in e) {
            r.fullName = e.fullName;
        };

        if ("email" in e) {
            r.email = e.email;
        };

        if ("mobile" in e) {
            r.mobile = e.mobile;
        };

        if ("address" in e) {
            r.address = e.address;
        };

        if ("vehicle_type" in e) {
            r.vehicle_type = e.vehicle_type;
        };

        if ("vehicle_number" in e) {
            r.vehicle_number = e.vehicle_number;
        };

        if ("FCM_Token" in e) {
            r.FCM_Token = e.FCM_Token;
        };

        if ("profilePic" in req.body || (req.files && req.files.profilePic)) {
            let oldImgName = r.profilePic.fileName;
            if (oldImgName) {
                let oldImgPath = path.join(riderImgFolder, oldImgName);
                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                };
            };

            let { profilePic } = req.files;
            if (!profilePic) {
                return res.status(400).send({
                    status: false,
                    message: 'No profilePic uploaded'
                })
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/riders/";
            let imgUniqName = uuid.v4() + "." + profilePic.name.split(".").pop();
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(riderImgFolder, imgUniqName);

            await profilePic.mv(imgSavingPath);

            imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl
            };

            r.profilePic = imgObj;
        };

        await r.save();
        
        SuccessResponse.data = r;
        return res.status(StatusCodes.CREATED).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
    }
};


// UPDATE RIDER
const deleteRider = async (req, res) => {
    try {
        let { riderId } = req.params;
        if (!riderId) {
            ErrorResponse.message = "rider Id is required";
            return res.status(StatusCodes.BAD_REQUEST).send({ ErrorResponse });
        };

        let r = await riderModel.findById(riderId);
        if (!r) {
            ErrorResponse.message = "rider not found";
            return res.status(StatusCodes.NOT_FOUND).send({ ErrorResponse });
        };

        let oldImgName = r.profilePic.fileName;
        if (oldImgName) {
            let oldImgPath = path.join(riderImgFolder, oldImgName);
            if (fs.existsSync(oldImgPath)) {
                fs.unlinkSync(oldImgPath);
            };
        };
        SuccessResponse.message = "Rider deleted successfully";
        return res.status(StatusCodes.CREATED).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ ErrorResponse });
    }
};


module.exports = {
    addRider,
    getRider,
    getAllRiders,
    updateRider,
    deleteRider
}