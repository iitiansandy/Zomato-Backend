const { isValidObjectId } = require('mongoose');
const { tokenSecretKey } = require('../config/config');
const adminModel = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const util = require('util');

// Promisify jwt.verify for async/await
const verifyToken = util.promisify(jwt.verify);


// AUTHENTICATION
const Authentication = async (req, res, next) => {
    try {
        const tokenWithBearer = req.headers["authorization"] || req.headers["Authorization"];
        // Check if the token is provided
        if (!tokenWithBearer) {
            return res.status(400).send({
                status: false,
                message: "Authorization token is required"
            });
        };

        console.log("tokenWithBearer: ", tokenWithBearer)

        // Extract the token from "Bearer <token>" format
        const [bearer, token] = tokenWithBearer.split(" ");

        // Check if the token is properly formatted
        if (bearer !== 'Bearer' || !token) {
            return res.status(400).send({
                status: false,
                message: 'Invalid token format'
            });
        };

        // verify and decode the token
        const decodedToken = await verifyToken(token, tokenSecretKey);

        /*
        decodedToken: {
            _id: '66ebcb628bc53721040f58b3',
            email: 'superadmin@gmail.com',
            iat: 1726735240,
            exp: 1726738840
          }
        */

        // Attach the decoded user/admin ID to the request
        req.adminId = decodedToken._id;
        // console.log("req.adminId:", req.adminId);
        next();

    } catch (error) {
        console.log(error);
        next(error);
    }
};


// AUTHORIZATION
const Authorization = async (req, res, next) => {
    try {
        const tokenId = req.adminId;
        // console.log("tokenId", tokenId);
        const { adminId } = req.params;

        if (!isValidObjectId(adminId)) {
            return res.status(400).send({
                status: false,
                message: `Invalid MongoDB Object ID: ${adminId}`
            });
        };

        let admin = await adminModel.findById(adminId);

        if (!admin) {
            return res.status(401).send({ status: false, message: 'Invalid credentials'});
        };

        if ( tokenId.toString() !== admin._id.toString() ) {
            return res.status(403).send({
                status: false,
                message: 'Authentication failed: Access denied'
            });
        };
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};


module.exports = {
    Authentication,
    Authorization
};