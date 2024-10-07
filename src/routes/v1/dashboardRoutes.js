const express = require('express');
const router = express.Router();

const { getDashboard } = require('../../controllers/dashboardController');


// CREATE ADMIN
router.get("/api/v1/getDashboard", getDashboard);
// router.post("/api/v1/login", adminLogin);

module.exports = router;