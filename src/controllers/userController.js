const customerModel = require("../models/customerModel");
let {
  getCurrentIPAddress,
  generateRandomAlphaNumericID,
} = require("../uitls/utils");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { port } = require("../config/config");
// const restaurantModel = require("../models/restaurantModel");
const { isValidObjectId } = require("mongoose");

const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const { uploadImage } = require("./imageController");
const { calculateDistance } = require("./restaurantController");

const {
  ok,
  internalServerError,
  badRequest,
  notFound,
  created,
  unauthorized,
} = require("../uitls/statusCodes");

let userImgFolder = path.join(__dirname, "..", "userImages");

// ADD A USER
const authenticateUser = async (req, res) => {
  try {
    let { userId, name, email, mobile, loginType, countryCode, code } =
      req.body;
    let isUserExists = await customerModel.findOne({ userId });

    if (loginType === "PHONE") {
      if (
        isUserExists &&
        isUserExists.isNewUser === false &&
        isUserExists.name &&
        isUserExists.gender
      ) {
        isUserExists.sessionToken = generateRandomAlphaNumericID(40);
        await isUserExists.save();
        SuccessResponse.data = isUserExists;
        SuccessResponse.message = "user already registered";
        SuccessResponse.success = true;
        return res.status(ok).send({ SuccessResponse });
      } else if (
        isUserExists &&
        isUserExists.isNewUser === true &&
        isUserExists.mobile
      ) {
        SuccessResponse.data = isUserExists;
        SuccessResponse.message = "user already authenticated";
        SuccessResponse.success = true;
        return res.status(ok).send({ SuccessResponse });
      } else {
        let userData = { userId, name, mobile, loginType, countryCode, code };
        let newUser = await customerModel.create(userData);
        SuccessResponse.data = newUser;
        SuccessResponse.message = "user authenticated successfully";
        SuccessResponse.success = true;
        return res.status(created).send({ SuccessResponse });
      }
    } else if (loginType === "EMAIL") {
      if (
        isUserExists &&
        isUserExists.isNewUser === false &&
        isUserExists.name &&
        isUserExists.gender
      ) {
        isUserExists.sessionToken = generateRandomAlphaNumericID(40);
        await isUserExists.save();
        SuccessResponse.data = isUserExists;
        SuccessResponse.message = "user already registered";
        SuccessResponse.success = true;
      } else if (
        isUserExists &&
        isUserExists.isNewUser === true &&
        isUserExists.email
      ) {
        SuccessResponse.data = isUserExists;
        SuccessResponse.success = trur;
        SuccessResponse.message = "user already authenticated";
        return res.status(ok).send({ SuccessResponse });
      } else {
        let userData = { userId, name, email, loginType };
        let newUser = await customerModel.create(userData);
        SuccessResponse.data = newUser;
        SuccessResponse.success = true;
        SuccessResponse.message = "user authenticated successfully";
        return res.status(created).send({ SuccessResponse });
      }
    }
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { userImages, registerModel } = req.body;
    let parsedData = JSON.parse(registerModel);

    /** Following is the structure of data, which we have to pass in postman
     * {"latitude": 12.9716,"longitude": 77.5946,"userId":"66f105dac517763d45079170"}
     */

    let userId = parsedData.userId;

    let user = await customerModel.findOne({ userId });
    if (!user) {
      ErrorResponse.message =
        "User is not authenticated, please authenticate the user first";
      ErrorResponse.success = false;
      return res.status(badRequest).send({ ErrorResponse });
    } else if (user && user.isNewUser === true) {
      let imgObj = { filePath: "", fileName: "" };
      if ("imageFile" in req.body || (req.files && req.files.imageFile)) {
        let { imageFile } = req.files;
        if (!imageFile) {
          return res.status(badRequest).send({
            status: false,
            message: "Please upload the profile pic",
          });
        }

        const relPath = "/userImages/";
        const saveDir = userImgFolder;
        imgObj = await uploadImage(req, res, relPath, saveDir);
      }

      user.profilePic = imgObj;
      if (user.profilePic.fileName && user.profilePic.filePath) {
        user.isVerifiedUser = true;
      }
      user.name = parsedData.name ?? user.name;
      user.email = parsedData.email ?? user.email;
      user.sessionToken = generateRandomAlphaNumericID(40);
      user.coordinates.latitude =
        parsedData.latitude ?? user.coordinates.latitude;
      user.coordinates.longitude =
        parsedData.longitude ?? user.coordinates.longitude;
      user.pronoun = parsedData.pronoun;
      user.address = parsedData.address;
      user.gender = parsedData.gender;
      user.isNewUser = false;
      await user.save();
      SuccessResponse.data = user;
      SuccessResponse.success = true;
      SuccessResponse.message = "User registered successfully";
      return res.status(ok).send({ SuccessResponse });
    } else if (user && user.isNewUser === false) {
      user.sessionToken = generateRandomAlphaNumericID(40);
      await user.save();
      SuccessResponse.data = user;
      SuccessResponse.message = "user already registered";
      SuccessResponse.success = true;
      return res.status(ok).send({ SuccessResponse });
    }
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    let allUsers = await customerModel.find({});
    SuccessResponse.data = allUsers;
    return res.status(ok).send({ SuccessResponse });
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    let { userId } = req.params;
    if (!userId) {
      return res.status(badRequest).send({
        status: false,
        message: "userId is required",
      });
    }

    let u = await customerModel.findOne({ userId });
    if (!u) {
      return res.status(notFound).send({
        status: false,
        message: "user not found",
      });
    }

    let e = req.body;
    if ("name" in e) {
      u.name = e.name;
    }

    if ("email" in e) {
      if (u.loginType === "PHONE") {
        u.email = e.email;
      } else {
        return res.status(unauthorized).send({
          status: false,
          message:
            "You cannot change your email as you loggedin through your email",
        });
      }
    }

    if ("mobile" in e) {
      if (u.loginType === "EMAIL") {
        u.mobile = e.mobile;
      } else {
        return res.status(unauthorized).send({
          status: false,
          message:
            "You cannot change your mobile number as you loggedin through it",
        });
      }
    }

    if ("address" in e) {
      u.address = e.address;
    }

    if ("gender" in e) {
      u.gender = e.gender;
    }

    if ("pronoun" in e) {
      u.pronoun = e.pronoun;
    }

    if ("imageFile" in req.body || (req.files && req.files.imageFile)) {
      let oldImgName = u.profilePic.fileName;
      if (oldImgName) {
        let oldImgPath = path.join(userImgFolder, oldImgName);
        if (fs.existsSync(oldImgPath)) {
          fs.unlinkSync(oldImgPath);
        }
      }

      let { imageFile } = req.files;
      if (!imageFile) {
        return res.status(badRequest).send({
          status: false,
          message: "Please upload the profile pic",
        });
      }

      const relPath = "/userImages/";
      const saveDir = userImgFolder;
      let updatedProfilePic = await uploadImage(req, res, relPath, saveDir);
      u.profilePic = updatedProfilePic;
    }

    await u.save();

    SuccessResponse.data = u;
    SuccessResponse.message = "user updated successfully";
    return res.status(ok).send({ SuccessResponse });
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    let { userId } = req.params;
    if (!userId) {
      return res.status(badRequest).send({
        status: false,
        message: "userId is required",
      });
    }

    let user = await customerModel.findOne({ userId });
    if (!user) {
      return res.status(notFound).send({
        status: false,
        message: "User not found",
      });
    }

    let oldImgName = user.profilePic.fileName;
    if (oldImgName) {
      let oldImgPath = path.join(userImgFolder, oldImgName);
      if (fs.existsSync(oldImgPath)) {
        fs.unlinkSync(oldImgPath);
      }
    }

    await customerModel.findOneAndDelete({ userId });

    return res.status(ok).send({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

module.exports = {
  authenticateUser,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
};
