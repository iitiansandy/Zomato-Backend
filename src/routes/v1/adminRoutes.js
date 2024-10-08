const express = require('express');
const router = express.Router();

const { createAdmin, adminLogin } = require('../../controllers/adminController');
const { authenticateUser, registerUser  } = require('../../controllers/userController');


// CREATE ADMIN
router.post("/api/v1/createAdmin", createAdmin);
router.post("/api/v1/login", adminLogin);

router.post("/api/v1/authenticateUser", authenticateUser);

router.post("/api/v1/registerUser", registerUser);

module.exports = router;