const express = require('express');
const router = express.Router();

const { createAdmin, adminLogin } = require('../../controllers/adminController');


// CREATE ADMIN
router.post("/api/v1/createAdmin", createAdmin);
router.post("/api/v1/login", adminLogin);

module.exports = router;