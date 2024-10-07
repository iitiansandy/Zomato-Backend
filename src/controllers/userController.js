const customerModel = require('../models/customerModel');
let { getCurrentIPAddress, generateRandomAlphaNumericID } = require("../uitls/utils");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcrypt');
const { StatusCodes } = require("http-status-codes");
const { port } = require("../config/config");
// const restaurantModel = require("../models/restaurantModel");
const { isValidObjectId } = require("mongoose");

const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const customerModel = require('../models/customerModel');
const { calculateDistance } = require('./restaurantController');
const { 
    ok, 
    internalServerError,
    badRequest,
    notFound,
    created
} = require('../uitls/statusCodes');


let userImgFolder = path.join(__dirname, "..", "userImages");

// ADD A USER
const addUser = async (req, res) => {
    try {
        let { userId, name, email, password, mobile, loginType, countryCode, code  } = req.body;
        let isUserExists = await customerModel.findOne({ userId });

        if (loginType === "PHONE") {
            if (isUserExists && isUserExists.isNewUser === false && isUserExists.name && isUserExists.gender) {
                isUserExists.sessionToken = generateRandomAlphaNumericID(40);
                await isUserExists.save();
                SuccessResponse.data = isUserExists;
                SuccessResponse.message = "user already registered";
                SuccessResponse.success = true;
                return res.status(ok).send({ SuccessResponse });
            } else if (isUserExists && isUserExists.isNewUser === true && isUserExists.mobile) {
                SuccessResponse.data = isUserExists;
                SuccessResponse.message = "user already authenticated";
                SuccessResponse.success = true;
                return res.status(ok).send({ SuccessResponse });
            } else {
                let userData = { userId, name, mobile, loginType, countryCode, code };
                let newUser = await customerModel.create(userData);
                SuccessResponse.data = newUser;
                SuccessResponse.message = "user authenticated authenticated";
                SuccessResponse.success = true;
                return res.status(ok).send({ SuccessResponse });
            }
        } else if (loginType === "EMAIL") {
            if (isUserExists && isUserExists.isNewUser === false && isUserExists.name && isUserExists.gender) {
                isUserExists.sessionToken = generateRandomAlphaNumericID(40);
                await isUserExists.save();
                SuccessResponse.data = isUserExists;
                SuccessResponse.message = "user already registered";
                SuccessResponse.success = true;
            } else if (isUserExists && isUserExists.isNewUser===true && isUserExists.email) {
                SuccessResponse.data = isUserExists;
                SuccessResponse.success = trur;
                SuccessResponse.message = "user already authenticated";
                return res.status(ok).send({ SuccessResponse });
            } else {
                let userData = {userId, name, email, loginType};
                let newUser = await customerModel.create(userData);
                SuccessResponse.data = newUser;
                SuccessResponse.success = true;
                SuccessResponse.message = "user authenticated successfully";
                return res.status(ok).send({SuccessResponse});
            }
        }
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { userImages, registerModel } = req.body;
        let parsedData = JSON.parse(registerModel);
        let userId = parsedData.userId;

        let user = await customerModel.findOne({ userId });
        if (!user) {
            return res.status(notFound).send({
                status: false,
                message: "user not found"
            });
        } else if (user && user.isNewUser===true) {
            let imgObj = { filePath: "", fileName: ""};
            if ("profilePic" in req.body || (req.files && req.files.profilePic)) {
                let { profilePic } = req.body;
                if (!profilePic) {
                    return res.status(badRequest).send({
                        status: false,
                        message: 'Please upload the profile pic'
                    });
                };

                if (!fs.existsSync(userImgFolder)) {
                    fs.mkdirSync(userImgFolder);
                };

                let currentIpAddress = getCurrentIPAddress();
                let imgRelativePath = "/userImages/";
                let imgUniqName = uuid.v4() + "." + profilePic.name.split(".").pop();
                let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
                let imgSavingPath = path.join(userImgFolder, imgUniqName);

                await profilePic.mv(imgSavingPath);

                imgObj = {
                    fileName: imgUniqName,
                    filePath: imgFullUrl
                };
            };

            user.profilePic = imgObj;
            user.name = parsedData.name?? user.name;
            user.email = parsedData.email ?? user.email;
            user.sessionToken = generateRandomAlphaNumericID(40);
            user.coordinates.latitude = parsedData.coordinates.latitude?? user.coordinates.latitude;
            user.coordinates.longitude = parsedData.coordinates.latitude?? user.coordinates.longitude;
            await user.save();
            SuccessResponse.data = user;
            SuccessResponse.success = true;
            SuccessResponse.message = "User registered successfully";
            return res.status(ok).send({SuccessResponse});

        } else if (user && user.isNewUser===false) {
            user.sessionToken = generateRandomAlphaNumericID(40);
            await user.save();
            SuccessResponse.data = user;
            SuccessResponse.message = "user already registered";
            SuccessResponse.success = true;
            return res.status(ok).send({SuccessResponse});
        } else {
            ErrorResponse.message = "User is not authenticated, please authenticate the user first";
            ErrorResponse.success = false;
            return res.status(badRequest).send({ErrorResponse});
        };

    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


module.exports = {
    addUser,
    registerUser
};