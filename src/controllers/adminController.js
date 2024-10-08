const adminModel = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { tokenSecretKey } = require('../config/config');
const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const { badRequest, created, internalServerError, unauthorized, ok } = require('../uitls/statusCodes');


// ADD ADMIN
const createAdmin = async (req, res) => {
    try {
        let { name, email, password, mobile, role } = req.body;

        if (!name || !email || !password || !mobile || !role) {
            return res.status(badRequest).send({ status: false, message: "All fields are required"});
        };

        let hashedPassward = await bcrypt.hash(password, 10);
        password = hashedPassward;

        if (role === "SUPER_ADMIN") {
            req.body["isSuperAdmin"] = true;
        };

        let adminObj = {
            name,
            email,
            password,
            mobile,
            role,
        };

        let newAdmin = await adminModel.create(adminObj);
        SuccessResponse.data = newAdmin;
        SuccessResponse.message = "Super Admin created successfully";
        return res.status(created).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// ADMIN LOGIN
const adminLogin = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(badRequest).send({ status: false, message: "Email and password are required"});
        };

        let admin = await adminModel.findOne({ email, isSuperAdmin: true });
        if (!admin) {
            return res.status(badRequest).send({ status: false, message: 'Invalid credentials'});
        };

        // Using async/await for bcrypt comparison
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(unauthorized).send({ status: false, message: 'Access denied' });
        }

        let date = Date.now();
        let issueTime = Math.floor(date / 1000);
        let token = jwt.sign(
            {
                _id: admin._id.toString(),
                email: admin.email,
                iat: issueTime
            },
            tokenSecretKey,
            { expiresIn: "1h" }
        );

        let data = {
            _id: admin._id.toString(),
            token: token
        };

        // Correct way to set the token in the Authorization header
        res.setHeader("Authorization", `Bearer ${token}`);

        return res.status(ok).send({
            status: true,
            message: "Success",
            data
        });
    } catch (error) {
        return res.status(internalServerError).send({ status: false, message: error.message });
    }
};

module.exports = {
    createAdmin,
    adminLogin
};