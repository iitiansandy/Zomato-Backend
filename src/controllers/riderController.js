const riderModel = require("../models/riderModel");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { isValidObjectId } = require("mongoose");

const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const customerModel = require("../models/customerModel");
const { calculateDistance } = require("./restaurantController");
const {
  badRequest,
  created,
  internalServerError,
  notFound,
  ok,
} = require("../uitls/statusCodes");
const { uploadImage } = require("./imageController");

let riderImgFolder = path.join(__dirname, "..", "riderImages");

// ADD RIDER
const addRider = async (req, res) => {
  try {
    let { userName, fullName, email, password, mobile } = req.body;

    let hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;

    let imgObj = { fileName: "", filePath: "" };
    if ("imageFile" in req.body || (req.files && req.files.imageFile)) {
      let { imageFile } = req.files;
      if (!imageFile) {
        return res.status(badRequest).send({
          status: false,
          message: "No profile pic uploaded",
        });
      }

      const relPath = "/riderImages/";
      const saveDir = riderImgFolder;
      imgObj = await uploadImage(req, res, relPath, saveDir);
    }

    let riderData = {
      userName,
      fullName,
      email,
      password,
      mobile,
      profilePic: imgObj,
    };
    let newRider = await riderModel.create(riderData);
    SuccessResponse.data = newRider;
    return res.status(created).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// GET RIDER BY ID
const getRider = async (req, res) => {
  try {
    let { riderId } = req.params;
    if (!riderId) {
      ErrorResponse.message = "rider Id is required";
      return res.status(badRequest).send({ ErrorResponse });
    }

    if (!isValidObjectId(riderId)) {
      ErrorResponse.message = "Invalid riderId";
      return res.status(badRequest).send({ ErrorResponse });
    }

    let r = await riderModel.findById(riderId);
    if (!r) {
      ErrorResponse.message = "rider not found";
      return res.status(notFound).send({ ErrorResponse });
    }

    SuccessResponse.data = r;
    return res.status(created).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// GET ALL RIDERS
const getAllRiders = async (req, res) => {
  try {
    let allRiders = await riderModel.find({});
    SuccessResponse.data = allRiders;
    return res.status(created).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// UPDATE RIDER
const updateRider = async (req, res) => {
  try {
    let { riderId } = req.params;
    if (!riderId) {
      ErrorResponse.message = "rider Id is required";
      return res.status(badRequest).send({ ErrorResponse });
    }

    let r = await riderModel.findById(riderId);
    if (!r) {
      ErrorResponse.message = "rider not found";
      return res.status(badRequest).send({ ErrorResponse });
    }

    let e = req.body;

    if ("userName" in e) {
      r.userName = e.userName;
    }

    if ("fullName" in e) {
      r.fullName = e.fullName;
    }

    if ("email" in e) {
      r.email = e.email;
    }

    if ("mobile" in e) {
      r.mobile = e.mobile;
    }

    if ("address" in e) {
      r.address = e.address;
    }

    if ("vehicle_type" in e) {
      r.vehicle_type = e.vehicle_type;
    }

    if ("vehicle_number" in e) {
      r.vehicle_number = e.vehicle_number;
    }

    if ("FCM_Token" in e) {
      r.FCM_Token = e.FCM_Token;
    }

    if ("imageFile" in req.body || (req.files && req.files.imageFile)) {
      let oldImgName = r.profilePic.fileName;
      if (oldImgName) {
        let oldImgPath = path.join(riderImgFolder, oldImgName);
        if (fs.existsSync(oldImgPath)) {
          fs.unlinkSync(oldImgPath);
        }
      }

      let { imageFile } = req.files;
      if (!imageFile) {
        return res.status(badRequest).send({
          status: false,
          message: "No profile pic uploaded",
        });
      }

      const relPath = "/riderImages/";
      const saveDir = riderImgFolder;
      let imgObj = await uploadImage(req, res, relPath, saveDir);
      r.profilePic = imgObj;
    }

    await r.save();

    SuccessResponse.data = r;
    return res.status(ok).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// UPDATE RIDER
const deleteRider = async (req, res) => {
  try {
    let { riderId } = req.params;
    if (!riderId) {
      ErrorResponse.message = "rider Id is required";
      return res.status(badRequest).send({ ErrorResponse });
    }

    let r = await riderModel.findById(riderId);
    if (!r) {
      ErrorResponse.message = "rider not found";
      return res.status(notFound).send({ ErrorResponse });
    }

    let oldImgName = r.profilePic.fileName;
    if (oldImgName) {
      let oldImgPath = path.join(riderImgFolder, oldImgName);
      if (fs.existsSync(oldImgPath)) {
        fs.unlinkSync(oldImgPath);
      }
    }
    SuccessResponse.message = "Rider deleted successfully";
    return res.status(created).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// GET CUSTOMER'S DISTANCE
const getCustomerDistance = async (req, res) => {
  try {
    let { customerId } = req.params;
    if (!customerId) {
      return res.status(badRequest).send({
        status: false,
        message: "Customer Id is required",
      });
    }

    let customer = await customerModel.findOne({ userId: customerId });
    if (!customer) {
      return res.status(badRequest).send({
        status: false,
        message: "No customer found with the given customerId",
      });
    }

    let riderId = req.adminId;

    let rider = await riderModel.findById(riderId);

    if (!rider) {
      return res.status(notFound).send({
        status: false,
        message: "No rider found with the given riderId",
      });
    }

    let e = rider.coordinates;
    let r = customer.coordinates;

    let distance = null;
    if (e.latitude && e.longitude && r.latitude && r.longitude) {
      distance = calculateDistance(
        e.latitude,
        e.longitude,
        r.latitude,
        r.longitude
      );
    }

    return res.status(ok).send({
      status: true,
      message: "Success",
      data: distance,
    });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

module.exports = {
  addRider,
  getRider,
  getAllRiders,
  updateRider,
  deleteRider,
  getCustomerDistance,
};
