const restaurantModel = require('../models/restaurantModel');
const { StatusCodes } = require('http-status-codes');

const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const logger = require("../config/logger.config");
const { isValidObjectId } = require("mongoose");
let { getCurrentIPAddress, generateRandomAlphaNumericID } = require("../uitls/utils");
let { port, adminSecretKey } = require("../config/config");
const { ErrorResponse, SuccessResponse } = require('../uitls/common');
const { created, internalServerError, badRequest, ok, notFound } = require('../uitls/statusCodes');


// function to calculate the distance between two sets of latitude and longitude coordinates
// (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius (mean radius) in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    let d = distance.toFixed(2);
    let roundedDistance = parseFloat(d);
    return roundedDistance;
};


const restImgFolder = path.join(__dirname, "..", "restaurantImages");
let bannerFolder = path.join(__dirname, "..", "banners");


// ADD RESTAURANT
const addRestaurant = async (req, res) => {
    try {

        let {
            name,
            description,
            address,
            city,
            state,
            country,
            postal_code,
            phone,
            email,
            website,
            opening_hours,
            cuisine_type,
            rating,
            isOpen,
            seating_capacity,
            slug,
            seo_keywords,
            seo_description,
            meta_title,
            meta_description,
            meta_keywords,
            latitude,
            longitude
        } = req.body;

        let coordinates = {
            latitude,
            longitude
        };

        let rest_Id;
        let isResIdAlreadyExists;
        do {
            rest_Id = generateRandomAlphaNumericID(10);
            isResIdAlreadyExists = await restaurantModel.findOne({ restaurant_Id: rest_Id });
        } while (isResIdAlreadyExists);

        let resData = {
            restaurant_Id: rest_Id,
            name,
            description,
            address,
            city,
            state,
            country,
            postal_code,
            phone,
            email,
            website,
            opening_hours,
            cuisine_type,
            rating,
            isOpen,
            seating_capacity,
            slug,
            seo_keywords,
            seo_description,
            meta_title,
            meta_description,
            meta_keywords,
            coordinates
        };

        let restaurant = await restaurantModel.create(resData);
        SuccessResponse.data = restaurant;
        SuccessResponse.message = "Restaurant added successfully";
        return res.status(created).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// ADD/UPDATE RESTAURANT RESTAURANT BANNERS
const addUpdateRestaurantBanners = async (req, res) => {
    try {
        let { restaurantId } = req.params;
        if (!restaurantId) {
            return res.status(badRequest).send({ 
                status: false, 
                message: "Bad Request!!!" 
            });
        };
        if (!isValidObjectId(restaurantId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid restaurantId'
            });
        };
        let restaurant = await restaurantModel.findById(restaurantId);

        let { ImageModel } = req.body;

        let parsedData = JSON.parse(ImageModel);

        let bannerImage = req.files.bannerImage;

        if (!bannerImage) {
            return res.status(badRequest).send({ 
                status: false, 
                message: "No banner image uploaded" 
            });
        };

        let index = parsedData.index; //{"isNewPick":false,"index":1,"img_id":"64ffebc1f3bfc5d77220193b","imageName":"1694493633669-432139964.jpg"}
        let img_id = parsedData.img_id ? parsedData.img_id : "";
        let imageName = parsedData.imageName;
        let isNewPick = parsedData.isNewPick;

        if (!fs.existsSync(bannerFolder)) {
            fs.mkdirSync(bannerFolder);
        };

        let currentIpAddress = getCurrentIPAddress();
        let imgRelativePath = "/banners/";
        let imgUniqName = uuid.v4() + "." + bannerImage.name.split(".").pop();
        let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
        let imgSavingPath = path.join(bannerFolder, imgUniqName);

        if (!isNewPick) {
            let oldImg = restaurant.banners[index].fileName;
            if (oldImg) {
                let oldImgPath = path.join(bannerFolder, oldImg);
                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                }
            };

            await bannerImage.mv(imgSavingPath);

            let imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl
            };

            restaurant.banners[index] = imgObj;
            await restaurant.save();
            return res.status(ok).send({
                status: true,
                message: "Banner updated successfully",
                data: restaurant.banners,
            });
        } else {
            await bannerImage.mv(imgSavingPath);

            let imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl
            };

            restaurant.banners.push(imgObj);
            await restaurant.save();
            return res.status(ok).send({
                status: true,
                message: "Banner added successfully",
                data: restaurant.banners,
            });
        };
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// DELETE RESTAURANT BANNERS
const deleteBanner = async (req, res) => {
    try {
        let { restId, imgId } = req.params;
        if (!restId || !imgId) {
            ErrorResponse.message = 'Rest Id and Image Id are required';
            return res.status(badRequest).send({ErrorResponse});
        };

        let rest = await restaurantModel.findById(restId);

        if (!rest) {
            ErrorResponse.message = `No restaurant found with this restaurant id: ${restId}`;
            return res.status(notFound).send({ErrorResponse});
        };

        let arr = rest.banners;

        for (let ele of arr) {
            if ( imgId === ele._id.toString() ) {
                let oldImg = ele.fileName;
                if (oldImg) {
                    let imgPath = path.join(__dirname, "..", "banners", oldImg);
                    if (fs.existsSync(imgPath)) {
                        fs.unlinkSync(imgPath);
                    };
                };
                let idx = arr.indexOf(ele);
                arr.splice(idx, 1);
                rest.banners = arr;
                await rest.save();
            };
        };

        SuccessResponse.data = rest;
        return res.status(StatusCodes.CREATED).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


// GET ALL RESTAURANTS
const getAllRestaurants = async (req, res) => {
    try {
        let allRestaurants = await restaurantModel.find({});
        SuccessResponse.data = allRestaurants;
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// GET RESTAURANT BY ID
const getRestaurantById = async (req, res) => {
    try {
        let { restaurantId } = req.params;
        if (!restaurantId) {
            return res.status(badRequest).send({ 
                status: false, 
                message: "Bad Request!!!" 
            });
        };
        if (!isValidObjectId(restaurantId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid restaurantId'
            });
        };
        let restaurant = await restaurantModel.findById(restaurantId);
        if (!restaurant) {
            return res.status(notFound).send({
                status: false,
                message: `No restaurant found with this id: ${restaurantId}`
            });
        };
        SuccessResponse.data = restaurant;
        return res.status(ok).send({SuccessResponse});

    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// UPDATE RESTAURANT
const updateRestaurant = async (req, res) => {
    try {
        let { restaurantId } = req.params;
        if (!restaurantId) {
            return res.status(badRequest).send({ 
                status: false, 
                message: "Bad Request!!!" 
            });
        };
        if (!isValidObjectId(restaurantId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid restaurantId'
            });
        };
        let r = await restaurantModel.findById(restaurantId);
        if (!r) {
            return res.status(notFound).send({
                status: false,
                message: `No restaurant found with this id: ${restaurantId}`
            });
        };

        let e = req.body;

        if ("name" in e) {
            r.name = e.name;
        };

        if ("description" in e) {
            r.description = e.description ;
        };

        if ("address" in e) {
            r.address = e.address;
        };

        if ("city" in e) {
            r.city = e.city;
        };

        if ("state" in e) {
            r.state = e.state;
        };

        if ("country" in e) {
            r.country = e.country;
        };

        if ("postal_code" in e) {
            r.postal_code = e.postal_code;
        };

        if ("phone" in e) {
            r.phone = e.phone;
        };

        if ("email" in e) {
            r.email = e.email;
        };

        if ("website" in e) {
            r.website = e.website;
        };

        if ("opening_hours" in e) {
            r.opening_hours = e.opening_hours;
        };

        if ("cuisine_type" in e) {
            r.cuisine_type = e.cuisine_type;
        };

        if ("rating" in e) {
            r.rating = e.rating;
        };

        if ("isOpen" in e) {
            r.isOpen = e.isOpen;
        };

        if ("seating_capacity" in e) {
            r.seating_capacity = e.seating_capacity;
        };

        if ("coordinates" in e) {
            r.coordinates.latitude = e.coordinates.latitude;
            r.coordinates.longitude = e.coordinates.longitude;
        };

        if ("FCM_Token" in e) {
            r.FCM_Token = e.FCM_Token;
        };

        if ("slug" in e) {
            r.slug = e.slug;
        };

        if ("seo_keywords" in e) {
            r.seo_keywords = e.seo_keywords;
        };

        if ("seo_description" in e) {
            r.seo_description = e.seo_description;
        };

        if ("meta_title" in e) {
            r.meta_title = e.meta_title;
        };

        if ("meta_description" in e) {
            r.meta_description = e.meta_description;
        };

        await r.save();

        SuccessResponse.data = r;
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// DELETE RESTAURANT
const deleteRestaurant = async (req, res) => {
    try {
        let { restaurantId } = req.params;
        if (!restaurantId) {
            return res.status(badRequest).send({ 
                status: false, 
                message: "Bad Request!!!" 
            });
        };
        if (!isValidObjectId(restaurantId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid restaurantId'
            });
        };

        let r = await restaurantModel.findById(restaurantId);
        if (!r) {
            return res.status(notFound).send({
                status: false,
                message: `No restaurant found with this id: ${restaurantId}`
            });
        };

        let arr = r.banners;
        if (arr.length) {
            for (let ele of arr) {
                let oldImg = ele.fileName;
                if (oldImg) {
                    let imgPath = path.join(__dirname, "..", "banners", oldImg);
                    if (fs.existsSync(imgPath)) {
                        fs.unlinkSync(imgPath);
                    };
                };
            };
        };

        await restaurantModel.findOneAndDelete({ _id: restaurantId });
        SuccessResponse.message = "Restaurant deleted successfully";
        return res.status(ok).send({SuccessResponse});

    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// SEARCH RESTAURANT BY KEYWORDS OR LOCATION
const searchRestaurantByLocationOrKeywords = async (req, res) => {
    try {
        let { searchType } = req.params;
        let e = req.body;

        let arr = ["BY_LOCATION", "BY_ADDRESS", "BY_KEYWORDS"];
        if (!arr.includes(searchType)) {
            return res.status(badRequest).send({
                status: true,
                message: "searchType can be only 'BY_LOCATION', 'BY_ADDRESS' OR 'BY_KEYWORDS' "
            });
        }

        if (searchType === "BY_LOCATION") {
            let latitude = e.latitude? e.latitude: null;
            let longitude = e.longitude? e.longitude: null;
            let range = e.range? e.range: 5;

            let allRestaurants = await restaurantModel.find({});

            let restaurantArr = [];

            for (let restaurant of allRestaurants) {
                let distance = null;
                if (latitude && longitude && restaurant.coordinates.latitude && restaurant.coordinates.longitude) {
                    distance = calculateDistance(latitude, longitude, restaurant.coordinates.latitude, restaurant.coordinates.longitude);
                };

                if (distance <= range) {
                    restaurantArr.push(restaurant);
                };
            };

            if (restaurantArr.length === 0) {
                range = e.range + 5 || 10;
                for (let restaurant of allRestaurants) {
                    let distance = null;
                    if (latitude && longitude && restaurant.coordinates.latitude && restaurant.coordinates.longitude) {
                        distance = calculateDistance(latitude, longitude, restaurant.coordinates.latitude, restaurant.coordinates.longitude);
                    };
    
                    if (distance <= range) {
                        restaurantArr.push(restaurant);
                    };
                };

                if (restaurantArr.length === 0) {
                    for (let restaurant of allRestaurants) {
                        restaurantArr.push(restaurant);
                    };
                };
            };

            restaurantArr.sort((a, b) => a.distance - b.distance);
            return res.status(ok).send({
                status: true,
                message: "success",
                data: restaurantArr,
            });


        } else if (searchType === "BY_ADDRESS") {
            let { address, city, state } = req.body;
            let filter = {};

            if (address) {
                filter["address"] = { $regex: address, $options: "i" };
            };

            if (city) {
                filter["city"] = { $regex: city, $options: "i" };
            };

            if (state) {
                filter["state"] = { $regex: state, $options: "i" };
            };

            let restaurants = await restaurantModel.find(filter);

            return res.status(ok).send({
                status: true,
                message: "Success",
                data: restaurants,
            });
        } else {
            let filter = {
                $or: [
                    { name: { $regex: searchType, $options: i }},
                    { description: { $regex: searchType, $options: i } },
                    { isVeg: { $regex: searchType, $options: i }}
                ]
            };

            let restaurants = await restaurantModel.find(filter);

            return res.status(ok).send({
                status: true,
                message: "Success",
                data: restaurants,
            });
        }
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


module.exports = {
    addRestaurant,
    addUpdateRestaurantBanners,
    deleteBanner,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    searchRestaurantByLocationOrKeywords,
    calculateDistance,
};