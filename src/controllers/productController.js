const productModel = require('../models/productModel');
const customerModel = require('../models/customerModel');

const { 
    created,
    ok,
    notFound,
    internalServerError,
    badRequest,
  } = require('../uitls/statusCodes');

const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const logger = require("../config/logger.config");
const { isValidObjectId } = require("mongoose");
let { getCurrentIPAddress } = require("../uitls/utils");
let { port, adminSecretKey } = require("../config/config");

const { SuccessResponse, ErrorResponse } = require('../uitls/common');
const { create } = require('../models/categoryModel');

let productImgFolder = path.join(__dirname, "..", "productImages");

// ADD PRODUCTS
const addProducts = async (req, res) => {
    try {
        let {
            name,
            description,
            price,
            category_id,
            restaurant_id,
            isAvailable,
            sku,
            stock_item,
            discount,
            product_description,
            status,
            original_price,
            isTaxable
        } = req.body;

        let imgObj = { fileName: "", filePath: "" };
        if ("product_image" in req.body || (req.files && req.files.product_image)) {
            let { product_image } = req.files;

            if (!product_image) {
                return res.status(notFound).send({
                    status: false,
                    message: 'Please upload the product image'
                });
            };

            if (!fs.existsSync(productImgFolder)) {
                fs.mkdirSync(productImgFolder);
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/productImages/";
            let imgUniqName = uuid.v4() + "." + product_image.name.split(".").pop();
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(productImgFolder, imgUniqName);

            await product_image.mv(imgSavingPath);

            imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl
            };
        };

        let productData = {
            name,
            description,
            price,
            category_id,
            restaurant_id,
            isAvailable,
            sku,
            stock_item,
            discount,
            product_description,
            status,
            original_price,
            isTaxable,
            product_image: imgObj
        };

        let newProduct = await productModel.create(productData);
        SuccessResponse.data = newProduct;
        return res.status(created).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        let products = await productModel.find({});
        SuccessResponse.data = products;
        return res.status(ok).send(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send(ErrorResponse);
    }
};


// GET PRODUCT BY ID
const getProductById = async (req, res) => {
    try {
        let { productId } = req.params;
        if (!productId) {
            return res.status(badRequest).send({
                status: false,
                message: 'productId is required'
            });
        };

        if (!isValidObjectId(productId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid productId'
            });
        };

        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(notFound).send({
                status: false,
                message: `No product found with this productId: ${productId}`
            });
        };

        SuccessResponse.data = product;
        return res.status(created).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// UPDATE PRODUCT BY ID
const updateProductById = async (req, res) => {
    try {
        let { productId } = req.params;
        if (!productId) {
            return res.status(badRequest).send({
                status: false,
                message: 'productId is required'
            });
        };

        if (!isValidObjectId(productId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid productId'
            });
        };

        let p = await productModel.findById(productId);
        if (!p) {
            return res.status(notFound).send({
                status: false,
                message: `No product found with this productId: ${productId}`
            });
        };

        let e = req.body;

        if ("name" in e) {
            p.name = e.name;
        };

        if ("description" in e) {
            p.description = e.description;
        };

        if ("price" in e) {
            p.price = e.price;
        };

        if ("category_id" in e) {
            p.category_id = e.category_id;
        };

        if ("restaurant_id" in e) {
            p.restaurant_id = e.restaurant_id;
        };

        if ("isAvailable" in e) {
            p.isAvailable = e.isAvailable;
        };

        if ("sku" in e) {
            p.sku = e.sku;
        };

        if ("stock_item" in e) {
            p.stock_item = e.stock_item;
        };

        if ("stock_item" in e) {
            p.stock_item = e.stock_item;
        };

        if ("discount" in e) {
            p.discount = e.discount;
        };

        if ("product_description" in e) {
            p.product_description = e.product_description;
        };

        if ("status" in e) {
            p.status = e.status;
        };

        if ("original_price" in e) {
            p.original_price = e.original_price;
        };

        if ("isTaxable" in e) {
            p.isTaxable = e.isTaxable;
        }

        if ("product_image" in req.body || (req.files && req.files.product_image)) {

            let oldImg = p.product_image.fileName;

            if (oldImg) {
                let imgPath = path.join(productImgFolder, oldImg);
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                };
            };

            let { product_image } = req.files;

            if (!product_image) {
                return res.status(notFound).send({
                    status: false,
                    message: 'Please upload the product image'
                });
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/productImages/";
            let imgUniqName = uuid.v4() + "." + product_image.name.split(".").pop();
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(productImgFolder, imgUniqName);

            await product_image.mv(imgSavingPath);

            imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl
            };

            p.product_image = imgObj;
        };

        await p.save();

        SuccessResponse.data = p;
        return res.status(ok).send({SuccessResponse});
    
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        let { productId } = req.params;
        if (!productId) {
            return res.status(badRequest).send({
                status: false,
                message: 'productId is required'
            });
        };

        if (!isValidObjectId(productId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid productId'
            });
        };

        let product = await productModel.findById(productId);

        if (!product) {
            return res.status(notFound).send({
                status: false,
                message: 'Product not found'
            });
        };

        let oldImgName = product.product_image.fileName;
        if (oldImgName) {
            let oldImgPath = path.join(productImgFolder, oldImgName);
            if (fs.existsSync(oldImgPath)) {
                fs.unlinkSync(oldImgPath);
            };
        };

        let deletedProduct = await productModel.findByIdAndDelete({ _id: productId });

        if (!deletedProduct) {
            return res.status(notFound).send({
                status: false,
                message: 'Product not found or already deleted'
            });
        };
        SuccessResponse.message = "product deleted successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


module.exports = {
    addProducts,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProduct
}
