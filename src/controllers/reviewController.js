const reviewModel = require('../models/reviewModel');
const { ErrorResponse, SuccessResponse } = require('../uitls/common');
const { ok, created, badRequest, notFound, internalServerError } = require('../uitls/statusCodes');
const { isValidObjectId } = require('mongoose');

// ADD REVIEW TO A RESTAURANT
const addReview = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(badRequest).send({
                status: false,
                message: "customerId is required",
            });
        };

        let isReviewAlreadyExists = await reviewModel.findOne({ customerId, restaurantId });
        if (isReviewAlreadyExists) {
            return res.status(badRequest).send({
                status: false,
                message: "Customer's review already exists for given restaurant"
            })
        };

        let {
            restaurantId,
            orderId,
            rating,
            comment,
            helpful_count
        } = req.body;

        let reviewData = {
            customerId,
            restaurantId,
            orderId,
            rating,
            comment,
            helpful_count
        };
        let newReview = await reviewModel.create(reviewData);
        SuccessResponse.data = newReview;
        SuccessResponse.message = "Review added successfully";
        return res.status(created).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// GET ALL REVIEWS
const getAllReviewsOfARestaurant = async (req, res) => {
    try {
        let { restaurantId } = req.params;
        if (!restaurantId) {
            return res.status(badRequest).send({
                status: false,
                message: "restaurantId is required",
            });
        };
        let reviewList = await reviewModel.find({ restaurantId });
        SuccessResponse.data = reviewList;
        SuccessResponse.message = "Review list fetched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// UPDATE REVIEW
const updateReview = async (req, res) => {
    try {
        let { reviewId } = req.params;
        if (!reviewId) {
            return res.status(badRequest).send({
                status: false,
                message: "reviewId is required",
            });
        };

        if (!isValidObjectId(reviewId)) {
            return res.status(badRequest).send({
                status: false,
                message: "Invalid reviewId",
            });
        };

        let r = await reviewModel.findById(reviewId);
        if (!r) {
            return res.status(notFound).send({
                status: false,
                message: "review not found",
            });
        };

        let e = req.body;

        if ("rating" in e) {
            r.rating = e.rating;
        };

        if ("comment" in e) {
            r.comment = e.comment;
        };
        SuccessResponse.data = r;
        SuccessResponse.message = "Review updated successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// DELETE REVIEW
const deleteReview = async (req, res) => {
    try {
        let { reviewId } = req.params;
        if (!reviewId) {
            return res.status(badRequest).send({
                status: false,
                message: "reviewId is required",
            });
        };

        if (!isValidObjectId(reviewId)) {
            return res.status(badRequest).send({
                status: false,
                message: "Invalid reviewId",
            });
        };

        let deletedReview = await reviewModel.findOneAndDelete({ _id: reviewId });

        if (!deletedReview) {
            return res.status(notFound).send({
                status: false,
                message: "review not found or already deleted",
            });
        };
        
        SuccessResponse.message = "Review deleted successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


module.exports = {
    addReview,
    getAllReviewsOfARestaurant,
    updateReview,
    deleteReview
};