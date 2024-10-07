const express = require('express');
const Router = express.Router();

const {
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} = require('../../controllers/categoryController');
const router = require('./dashboardRoutes');

// ADD CATEGORY
router.post("/api/v1/addCategory", addCategory);

// GET ALL CATGORIES
router.get("/api/v1/getAllCategories", getAllCategories);

// UPDATE CATEGORY
router.put("/api/v1/updateCategory/:categoryId",  updateCategory);

// DELETE CATEGORY
router.delete('/api/v1/delCat/:catID', deleteCategory);


module.exports = router;