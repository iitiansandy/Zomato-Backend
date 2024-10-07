const express = require('express');
const router = express.Router();
const { Authentication, Authorization } = require('../../middlewares/auth');

const {
    addProducts,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProduct,
} = require('../../controllers/productController');

// ADD PRODUCTS
router.post("/api/v1/addProduct/:adminId", Authentication, Authorization, addProducts);

// GET ALL PRODUCTS
router.get("/api/v1/getAllProducts", getAllProducts);

// GET PRODUCT BY ID
router.get("/api/v1/getProduct/:productId", getProductById);

// UPDATE PRODUCT
router.put("/api/v1/updateProduct/:productId/:adminId", Authentication, Authorization, updateProductById);

// DELETE PRODUCT
router.delete("/api/v1/deleteProduct/:productId/:adminId", Authentication, Authorization, deleteProduct);


module.exports = router;