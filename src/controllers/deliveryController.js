const { isValidObjectId } = require('mongoose');
const deliveryModel = require('../models/deliveryModel');
const orderModel = require('../models/orderModel');

// CREATE DELIVERY
const createDelivery = async (req, res) => {
    try {
        let { orderId } = req.params;

        if (!orderId) {
            return res.status(400).send({
                status: false,
                message: 'order id is required'
            });
        };

        if (!isValidObjectId(orderId)) {
            return res.status(400).send({
                status: false,
                message: 'Invalid order id'
            });
        };

        let order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(400).send({
                status: false,
                message: 'No order found with given order id'
            });
        };

        let { riderId, status, delivery_time } = req.body;

        let deliveryData = { orderId, riderId, status, delivery_time };

        let newDelivery = await deliveryModel.create(deliveryData);

        SuccessResponse.data = newDelivery;
        SuccessResponse.message = "New delivery created successfully";
        return res.status(StatusCodes.OK).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


// GET ALL DELIVERIES
const getAllDeliveries = async (req, res) => {
    try {
        let allDeliveries = await deliveryModel.find({});
        SuccessResponse.data = allDeliveries;
        SuccessResponse.message = "All deliveries fetched successfully";
        return res.status(StatusCodes.OK).send({SuccessResponse});

    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


// UPDATE DELIVERY STATUS
const updateDeliveryStatus = async (req, res) => {
    try {
        let { deliveryId } = req.params;

        if (!deliveryId) {
            return res.status(400).send({
                status: false,
                message: 'deliveryId is required'
            });
        };

        if (!isValidObjectId(deliveryId)) {
            return res.status(400).send({
                status: false,
                message: 'Invalid deliveryId'
            });
        };

        let delivery = await deliveryModel.findById(deliveryId);
        if (!delivery) {
            return res.status(400).send({
                status: false,
                message: 'No delivery found with given delivery id'
            });
        };

        delivery.status = req.body.status;
        await delivery.save();
        SuccessResponse.data = delivery;
        SuccessResponse.message = "delivery updated successfully";
        return res.status(StatusCodes.OK).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


// DELETE DELIVERY BY ID
const deleteDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        if (!deliveryId) {
            return res.status(400).send({
                status: false,
                message: 'deliveryId is required'
            });
        };

        if (!isValidObjectId(deliveryId)) {
            return res.status(400).send({
                status: false,
                message: 'Invalid delivery Id'
            })
        };

        let deletedDelivery = await deliveryModel.findOneAndDelete({ _id: deliveryId });
        if (!deletedDelivery) {
            return res.status(404).send({
                status: false,
                message: 'No delivery found with given delivery Id'
            });
        };

        return res.status(200).send({
            status: true,
            message: 'Delivery deleted successfully'
        });

    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ErrorResponse});
    }
};


module.exports = {
    createDelivery,
    updateDeliveryStatus,
    getAllDeliveries,
    deleteDelivery
};