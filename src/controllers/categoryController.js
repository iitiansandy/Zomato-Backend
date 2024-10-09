const categoryModel = require("../models/categoryModel");
let { getCurrentIPAddress } = require("../uitls/utils");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { port } = require("../config/config");
const restaurantModel = require("../models/restaurantModel");
const { isValidObjectId } = require("mongoose");
const {
  badRequest,
  created,
  internalServerError,
  ok,
  notFound,
} = require("../uitls/statusCodes");

const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const { uploadImage } = require("./imageController");

let catImgFolder = path.join(__dirname, "..", "categoryImages");

// ADD CATEGORY
const addCategory = async (req, res) => {
  try {
    let { name, description } = req.body;
    let imgData = { fileName: "", filePath: "" };
    if (req.files && req.files.imageFile) {
      const relPath = "/categoryImages/"; // Relative path for the image URL
      const saveDir = catImgFolder; // Absolute path for saving the image
      imgData = await uploadImage(req, res, relPath, saveDir); // Use the updated uploadImage function
    }

    let categoryObj = {
      name,
      description,
      category_image: imgData,
    };

    let newCategory = await categoryModel.create(categoryObj);
    SuccessResponse.data = newCategory;
    return res.status(created).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// // GET CATEGORY BY SERVICE SEARCH {allProductSearchByKeywords}
const getRestaurantByKeywords = async (req, res) => {
  try {
    let { categoryId } = req.params;
    let { search_data } = req.body;

    if (categoryId) {
      let restaurants = await restaurantModel.find({ categoryId });

      return res.status(ok).send({
        status: true,
        message: "Success",
        data: restaurants,
      });
    } else {
      let filter = {
        $or: [
          { name: { $regex: search_data, $options: "i" } },
          { description: { $regex: search_data, $options: "i" } },
          { address: { $regex: search_data, $options: "i" } },
          { city: { $regex: search_data, $options: "i" } },
          { state: { $regex: search_data, $options: "i" } },
          { isOpen: { $regex: search_data, $options: "i" } },
          { meta_title: { $regex: search_data, $options: "i" } },
          { meta_description: { $regex: search_data, $options: "i" } },
        ],
      };

      let restaurants = await restaurantModel.find(filter);

      return res.status(ok).send({
        status: true,
        message: "Success",
        data: restaurants,
      });
    }
  } catch (error) {
    return res
      .status(internalServerError)
      .send({ status: false, message: error.message });
  }
};

// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
  try {
    let categories = await categoryModel.find({});
    SuccessResponse.data = categories;
    return res.status(ok).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// UPDATE CATEGORY BY CATEGORY ID
const updateCategory = async (req, res) => {
  try {
    let { categoryId } = req.params;
    if (!categoryId) {
      return res
        .status(badRequest)
        .send({ status: false, message: "Category Id is required" });
    }

    if (!isValidObjectId(categoryId)) {
      return res
        .status(badRequest)
        .send({ status: false, message: "Invalid Category Id" });
    }

    let category = await categoryModel.findById(categoryId);

    if (!category) {
      return res
        .status(notFound)
        .send({ status: false, message: "Category Not Found" });
    }

    let reqBody = req.body;

    if ("name" in reqBody) {
      category.name = reqBody.name;
    }

    if ("description" in reqBody) {
      category.description = reqBody.description;
    }

    if ("imageFile" in reqBody || (req.files && req.files.imageFile)) {
      let oldImgName = category.category_image.fileName;
      if (oldImgName) {
        let oldImgPath = path.join(catImgFolder, oldImgName);
        if (fs.existsSync(oldImgPath)) {
          fs.unlinkSync(oldImgPath);
        }
      }

      let imageFile = req.files.imageFile;
      if (!imageFile) {
        return res
          .status(badRequest)
          .send({ status: false, message: "No category images uploaded" });
      }

      let imgData = { fileName: "", filePath: "" };
      const relPath = "/categoryImages/"; // Relative path for the image URL
      const saveDir = catImgFolder; // Absolute path for saving the image
      imgData = await uploadImage(req, res, relPath, saveDir); // Use the updated uploadImage function
      category.category_image = imgData;
    }

    await category.save();

    return res.status(ok).send({
      status: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res
      .status(internalServerError)
      .send({ status: false, message: error.message });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    let { categoryId } = req.params;
    if (!categoryId) {
      return res
        .status(badRequest)
        .send({ status: false, message: "CategoryId is required" });
    }

    let category = await categoryModel.findById(categoryId);

    if (!category) {
      return res.status(notFound).send({
        status: false,
        message: "No category found with this category Id",
      });
    }

    let oldImgName = category.category_image.fileName;
    if (oldImgName) {
      let oldImgPath = path.join(catImgFolder, oldImgName);
      if (fs.existsSync(oldImgPath)) {
        fs.unlinkSync(oldImgPath);
      }
    }

    await categoryModel.deleteOne({ _id: categoryId });

    return res.status(ok).send({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res
      .status(internalServerError)
      .send({ status: false, message: error.message });
  }
};

module.exports = {
  addCategory,
  getRestaurantByKeywords,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
