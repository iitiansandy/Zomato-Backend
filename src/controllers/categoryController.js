const categoryModel = require('../models/categoryModel');
let { getCurrentIPAddress } = require("../uitls/utils");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { port } = require("../config/config");
const restaurantModel = require("../models/restaurantModel");
const { isValidObjectId } = require("mongoose");
const { badRequest, created, internalServerError, ok, notFound } = require('../uitls/statusCodes');

const { ErrorResponse, SuccessResponse } = require("../uitls/common");

let catImgFolder = path.join(__dirname, "..", "categoryImages");

// ADD CATEGORY
const addCategory = async (req, res) => {
    try {
        let { name, description } = req.body;

        let { category_image } = req.files;

        if (!category_image) {
            return res.status(badRequest).send({ status: false, message: "No category Image uploaded" });
        };

        if (!fs.existsSync(catImgFolder)) {
            fs.mkdirSync(catImgFolder);
        };

        let currentIpAddress = getCurrentIPAddress();
        let imgRelativePath = "/categoryImages/";
        let imgUniqName = uuid.v4() + "." + category_image.name.split(".").pop();
        let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
        let imgSavingPath = path.join(catImgFolder, imgUniqName);

        await category_image.mv(imgSavingPath);

        let imgObj = {
            fileName: imgUniqName,
            filePath: imgFullUrl,
        };

        let categoryObj = {
            name,
            description,
            category_image: imgObj,
        };

        let newCategory = await categoryModel.create(categoryObj);
        SuccessResponse.data = newCategory;
        return res.status(created).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// // GET CATEGORY BY SERVICE SEARCH {allProductSearchByKeywords}
const getRestaurantByKeywords  = async (req, res) => {
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
        return res.status(internalServerError).send({ status: false, message: error.message });
    }
};


// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
    try {
        let categories = await categoryModel.find({});
        SuccessResponse.data = categories;
        return res.status(ok).send({SuccessResponse});
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
            return res.status(badRequest).send({ status: false, message: "Category Id is required" });
        };

        if (!isValidObjectId(categoryId)) {
            return res.status(badRequest).send({ status: false, message: "Invalid Category Id" });
        };

        let category = await categoryModel.findById(categoryId);

        if (!category) {
            return res.status(notFound).send({ status: false, message: "Category Not Found" });
        };

        let reqBody = req.body;

        if ("name" in reqBody) {
            category.name = reqBody.name;
        };

        if ("description" in reqBody) {
            category.description = reqBody.description;
        };

        if ("category_image" in reqBody || (req.files && req.files.category_image)) {
            let category_image = req.files.category_image;
            if (!category_image) {
                return res.status(badRequest).send({ status: false, message: "No category images uploaded" });
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/categoryImages/";
            let imgUniqName = uuid.v4() + "." + category_image.name.split(".").pop();
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(catImgFolder, imgUniqName);

            let oldImgName = category.category_image.imageName;
            if (oldImgName) {
                let oldImgPath = path.join(catImgFolder, oldImgName);
                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                };
            };
            
            await category_image.mv(imgSavingPath);

            let newImgObj = {
                imageName: imgUniqName,
                imagePath: imgFullUrl,
            };

            category.category_image = newImgObj;
        };

        await category.save();

        return res.status(ok).send({
            status: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        return res.status(internalServerError).send({ status: false, message: error.message });
    };
};


// DELETE CATEGORY
const deleteCategory = async (req, res) => {
    try {
        let { categoryId } = req.params;
        if (!categoryId) {
            return res.status(badRequest).send({ status: false, message: "CategoryId is required" });
        };

        let category = await categoryModel.findById(categoryId);

        if (!category) {
            return res.status(notFound).send({ status: false, message: "No category found with this category Id"})
        };

        let oldImgName = category.category_image.fileName;
        if (oldImgName) {
            let oldImgPath = path.join(catImgFolder, oldImgName);
            if (fs.existsSync(oldImgPath)) {
                fs.unlinkSync(oldImgPath);
            }
        };

        await categoryModel.deleteOne({ _id: categoryId });

        return res.status(ok).send({
            status: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        return res.status(internalServerError).send({ status: false, message: error.message });
    };
};


module.exports = {
    addCategory,
    getRestaurantByKeywords,
    getAllCategories,
    updateCategory,
    deleteCategory
}