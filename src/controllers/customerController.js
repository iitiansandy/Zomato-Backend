const customerModel = require("../models/customerModel");

const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const logger = require("../config/logger.config");
const { isValidObjectId } = require("mongoose");
let { getCurrentIPAddress, generateRandomAlphaNumericID } = require("../uitls/utils");
let { port, adminSecretKey } = require("../config/config");
const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const riderModel = require("../models/riderModel");
const { calculateDistance } = require("./restaurantController");
const { ok, created, notFound, badRequest, internalServerError } = require('../uitls/statusCodes');


let userImgFolder = path.join(__dirname, "..", "userImages");

// CUSTOMER LOGIN
const customerLogin = async (req, res) => {
    try {
        const { userId, name, mobile, email, loginType, countryCode, code } = req.body;

        let isUserExists = await customerModel.findOne({ userId });

        if (loginType === "PHONE") {
            if (isUserExists && isUserExists.isNewUser === false && isUserExists.name && isUserExists.gender) {
                isUserExists.sessionToken = generateRandomAlphaNumericID(24);
                await isUserExists.save();
                SuccessResponse.data = isUserExists;
                SuccessResponse.message = "user already registered";
                return res.status(ok).send({ SuccessResponse });
            } else if (isUserExists && isUserExists.isNewUser === true && isUserExists.mobile) {
                SuccessResponse.data = isUserExists;
                SuccessResponse.message = "user already authenticated";
                return res.status(ok).send({ SuccessResponse });
            } else {
                let userData = { userId, name, mobile, loginType, countryCode, code };
                let newUser = await customerModel.create(userData);
                SuccessResponse.data = newUser;
                SuccessResponse.message = "user successfully authenticated";
                SuccessResponse.success = true;
                return res.status(created).send({ SuccessResponse });
            }
        } else if (loginType === "GMAIL") {
            if (isUserExists && isUserExists.isNewUser === false && isUserExists.name && isUserExists.gender) {
                isUserExists.sessionToken = generateRandomAlphaNumericID(24);
                await isUserExists.save();
                SuccessResponse.data = isUserExists;
                SuccessResponse.message = "user already registered";
                SuccessResponse.success = true;
                return res.status(ok).send({ SuccessResponse });
            } else if (isUserExists && isUserExists.isNewUser === true && isUserExists.email) {
                SuccessResponse.data = isUserExists;
                SuccessResponse.success = true;
                SuccessResponse.message = "user already authenticated";
                return res.status(ok).send({ SuccessResponse });
            } else {
                let userData = { userId, name, email, loginType };
                let newUser = await customerModel.create(userData);
                SuccessResponse.data = newUser;
                SuccessResponse.success = true;
                SuccessResponse.message = "user successfully authenticated";
                return res.status(created).send({ SuccessResponse });
            }
        }
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};

// REGISTER USER / UPDATE USER
const registerUser = async (req, res) => {
    try {
        const { userImages, registerModel } = req.body;
        const parsedData = JSON.parse(registerModel);
        let userId = parsedData.userId;
        let isUserExists = await customerModel.findOne({ userId });
        if (!isUserExists) {
            return res.status(notFound).send({
                status: false,
                message: "User is not authenticated, please authenticate the user first",
            });
        } else if (isUserExists && isUserExists.isNewUser === true) {
            let imgObj = null;
            if ("profilePic" in req.body || (req.files && req.files.profilePic)) {
                let { profilePic } = req.files;
                if (!profilePic) {
                    return res.status(badRequest).send({
                        status: false,
                        error: "No valid profilePic uploaded.",
                    });
                }

                if (!fs.existsSync(userImgFolder)) {
                    fs.mkdirSync(userImgFolder);
                }

                let currentIpAddress = getCurrentIPAddress();
                let imgRelativePath = "/userImages/";
                let imgUniqName = uuid.v4() + "." + profilePic.name.split(".").pop();
                let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
                let imgSavingPath = path.join(userImgFolder, imgUniqName);

                await profilePic.mv(imgSavingPath);

                imgObj = {
                    fileName: imgUniqName,
                    filePath: imgFullUrl,
                };
            };

            isUserExists.name = parsedData.name;
            isUserExists.pronoun = parsedData.pronoun;
            isUserExists.email = parsedData.email? parsedData.email: isUserExists.email;
            isUserExists.mobile = parsedData.mobile? parsedData.mobile: isUserExists.mobile;
            isUserExists.gender = parsedData.gender;
            isUserExists.sessionToken = generateRandomAlphaNumericID(24);
            isUserExists.countryCode = parsedData.countryCode? parsedData.countryCode: isUserExists.countryCode;
            isUserExists.code = parsedData.code? parsedData.code: isUserExists.code;
            isUserExists.address = parsedData.address;
            isUserExists.profilePic = imgObj;
            isUserExists.coordinates.latitude = parsedData.coordinates.latitude;
            isUserExists.coordinates.longitude = parsedData.coordinates.longitude;
            await isUserExists.save();
            SuccessResponse.data = isUserExists;
            return res.status(ok).send({SuccessResponse});
        } else if (isUserExists.isNewUser===false) {
            isUserExists.sessionToken = generateRandomAlphaNumericID(24);
            await isUserExists.save();
            SuccessResponse.data = isUserExists;
            return res.status(ok).send({SuccessResponse});
        }
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        let users = await customerModel.find({});
        SuccessResponse.data = users;
        SuccessResponse.message = "User list fetched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// UPDATE USER
const updateUser = async (req, res) => {
    try {
        let { userId } = req.params;
        if (!userId) {
            ErrorResponse.message = "UserId is required";
            return res.status(badRequest).send({ ErrorResponse });
        };

        let u = await customerModel.findOne({ userId });
        if (!u) {
            ErrorResponse.message = `No user found with this userId: ${userId}`;
            return res.status(notFound).send({ ErrorResponse });
        };

        let e = req.body;

        if ("name" in e) {
            u.name = e.name;
        };

        if ("pronoun" in e) {
            u.pronoun = e.pronoun;
        };

        if ("email" in e && u.loginType === "PHONE") {
            u.email = e.email;
        };

        if ("mobile" in e && u.loginType === "EMAIL") {
            u.mobile = e.mobile;
        };

        if ("gender" in e) {
            u.gender = e.gender;
        };

        if ("countryCode" in e) {
            u.countryCode = e.countryCode;
        };

        if ("code" in e) {
            u.code = e.code;
        };

        if ("address" in e) {
            u.address = e.address;
        };

        if ("FCM_Token" in e) {
            u.FCM_Token = e.FCM_Token;
        };

        if ("profilePic" in e || (req.files && req.files.profilePic)) {
            let oldPicName = u.profilePic.fileName;
            if (oldPicName) {
                let oldPicPath = path.join(userImgFolder, oldPicName);
                if (fs.existsSync(oldPicPath)) {
                    fs.unlinkSync(oldPicPath);
                }
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/userImages/";
            let imgUniqName = uuid.v4() + "." + profilePic.name.split(".").pop();
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(userImgFolder, imgUniqName);

            await profilePic.mv(imgSavingPath);

            let imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl,
            };
            u.profilePic = imgObj;
        };

        await u.save();

        SuccessResponse.data = u;
        SuccessResponse.message = "User updated successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// DELETE USER
const deleteUser = async (req, res) => {
    try {
        let { userId } = req.params;
        if (!userId) {
            ErrorResponse.message = "UserId is required";
            return res.status(badRequest).send({ ErrorResponse });
        };

        let u = await customerModel.findOne({ userId });
        if (!u) {
            ErrorResponse.message = `No user found with this userId: ${userId}`;
            return res.status(notFound).send({ ErrorResponse });
        };

        let oldImgName = u.profilePic.fileName;
        if (oldImgName) {
            let oldImgPath = path.join(userImgFolder, oldImgName);
            if (fs.existsSync(oldImgPath)) {
                fs.unlinkSync(oldImgPath);
            };
        };

        await customerModel.findByIdAndDelete({ userId });
        SuccessResponse.message = "User deleted successfully";
        return res.status(ok).send({SuccessResponse});

    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// GET RIDER DISTANCE
const getRiderDistance = async (req, res) => {
    try {
        let { userId, riderId } = req.params;
        if (!userId || !riderId) {
            return res.status(badRequest).send({
                status: false,
                message: "userId and riderId are required"
            });
        };

        let user = await customerModel.findOne({ userId });
        if (!user) {
            return res.status(notFound).send({
                status: false,
                message: "user not found"
            });
        };

        let rider = await riderModel.findById(riderId);
        if (!rider) {
            return res.status(notFound).send({
                status: false,
                message: "rider not found"
            });
        };

        let distance = null;
        if (user.coordinates.latitude && user.coordinates.longitude && rider.coordinates.latitude && rider.coordinates.longitude) {
            distance = calculateDistance(user.coordinates.latitude, user.coordinates.longitude, rider.coordinates.latitude, rider.coordinates.longitude)
        };

        SuccessResponse.data = distance;
        SuccessResponse.message = "distance fetched successfully";
        return res.status(ok).send({SuccessResponse});

    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};



module.exports = {
    customerLogin,
    registerUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getRiderDistance
};
