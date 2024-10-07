const express = require('express');
const router = express.Router();

const { 
    addRestaurant,
    addUpdateRestaurantBanners,
    deleteBanner,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    searchRestaurantByLocationOrKeywords,

} = require('../../controllers/restaurantController');

// ADD RESTAURANT
router.post("/api/v1/addRestaurant", addRestaurant);

// ADD/UPDATE RESTAURANT BANNERS
router.post("/api/v1/addUpdateBanners/:restaurantId", addUpdateRestaurantBanners);

// DELETE RESTAURANT BANNERS
router.delete("/api/v1/deleteBanner/:restId/:imgId", deleteBanner);

// GET ALL RESTAURANTS
router.get("/api/v/getAllRestaurants", getAllRestaurants);

// SEARCH RESTAURANT BY SEARCH TYPE
router.get("/api/v1/searchRestaurantByLocationOrKeywords/:searchType", searchRestaurantByLocationOrKeywords);

// GET RESTAURANT BY ID
router.get("/api/v1/getRestaurant/:restaurantId", getRestaurantById);

// UPDATE RESTAURANT
router.put("/api/v1/updateRestaurant/:restaurantId", updateRestaurant);

// DELETE RESTAURANT
router.delete("/api/v1/deleteRestaurant/:restaurantId", deleteRestaurant);


module.exports = router;