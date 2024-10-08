const orderModel = require('../models/orderModel');

let { getCurrentIPAddress, isValidInteger } = require("../uitls/utils");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { port } = require("../config/config");
const restaurantModel = require("../models/restaurantModel");
const { isValidObjectId } = require("mongoose");
const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const { badRequest, internalServerError, notFound, ok } = require('../uitls/statusCodes');

// CREATE ORDER
const createOrder = async (req, res) => {
    try {
        let {
            customerNote,
            riderNote,
            customer_id,
            restaurant_id,
            rider_id,
            order_items,
            delivery_address,
            delivery_time,
            tax,
            status
        } = req.body;

        let items = [];

        for (let itemData of order_items) {
            let { itemId, item_name, quantity, one_qty_price, imgUrl, isVeg, isTaxable, order_date } = itemData;

            if (!isValidInteger(quantity)) {
                return res.status(badRequest).send({
                    status: false,
                    message: "Invalid quantity, please provide a valid quantity",
                });
            }

            if (!isValidInteger(one_qty_price)) {
                return res.status(badRequest).send({
                    status: false,
                    message: "Invalid one_qty_price, please provide a valid one_qty_price",
                });
            }

            let total_price = one_qty_price * quantity;

            items.push({
                itemId,
                item_name,
                quantity,
                one_qty_price,
                total_price,
                imgUrl,
                isVeg,
                isTaxable,
                order_date
            });
        };

        total_items = order_items.length;

        let total = 0;
        for (let item of order_items) {
            total += item.one_qty_price * item.quantity;
        };

        let grand_total = total + tax;

        let orderData = {
            customerNote,
            riderNote,
            customer_id,
            restaurant_id,
            rider_id,
            order_items: items,
            total_items,
            total,
            tax,
            grand_total,
            delivery_address,
            delivery_time,
            status
        };

        let newOrder = await orderModel.create(orderData);
        SuccessResponse.data = newOrder;
        SuccessResponse.message = "order created successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// GET ORDER BY ID
const getOrder = async (req, res) => {
    try {
        let { orderId } = req.params;
        if (!orderId) {
            return res.status(badRequest).send({
                status: false,
                message: 'order id is required'
            });
        };

        if (!isValidObjectId(orderId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid order id'
            });
        };

        let order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(notFound).send({
                status: false,
                message: 'No order found with given order id'
            });
        };

        SuccessResponse.data = order;
        SuccessResponse.message = "order fatched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// GET ORDER LIST
const getCompletedOrderList = async (req, res) => {
    try {
        let orders = await orderModel.find({ status: "Completed" });
        SuccessResponse.data = orders;
        SuccessResponse.message = "Completed order list fatched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internal).send({ErrorResponse});
    }
};


// GET CANCELLED ORDER LIST
const getCancelledOrderList = async (req, res) => {
    try {
        let orders = await orderModel.find({ status: "Cancelled" });
        SuccessResponse.data = orders;
        SuccessResponse.message = "Cancelled order list fatched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// GET ALL PENDING ORDERS
const getAllPendingOrders = async (req, res) => {
    try {
        let orders = await orderModel.find({ status: "Pending" });
        SuccessResponse.data = orders;
        SuccessResponse.message = "Pending order list fatched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
}


// GET ALL ORDERS DELIVERED BY A RIDER
const getAllOrdersOfARider = async (req, res) => {
    try {
        let { riderId } = req.params;
        if (!riderId) {
            return res.status(badRequest).send({
                status: false,
                message: 'Rider Id is required'
            });
        };

        let riderOrderList = await orderModel.find({ rider_id: riderId, status: "Completed" });
        SuccessResponse.data = riderOrderList;
        SuccessResponse.message = "Rider order list fatched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
}


// UPDATE ORDER
const updateOrder = async (req, res) => {
    try {
        let { orderId, itemId } = req.params;
        if (!orderId || !itemId) {
            return res.status(badRequest).send({
                status: false,
                message: 'order id and item id is required'
            });
        };

        if (!isValidObjectId(orderId) || !isValidObjectId(itemId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid order id or item id'
            });
        };

        let o = await orderModel.findById(orderId);
        if (!o) {
            return res.status(badRequest).send({
                status: false,
                message: 'No order found with given order id'
            });
        };

        let e = req.body;

        if ("customerNote" in e) {
            o.customerNote = e.customerNote;
        };

        if ("riderNote" in e) {
            o.riderNote = e.riderNote;
        };

        if ("tax" in e) {
            o.tax = e.tax;
        };

        if ("delivery_address" in e) {
            o.delivery_address = e.delivery_address;
        };

        if ("delivery_time" in e) {
            o.delivery_time = e.delivery_time;
        };

        // if ("status" in e) {
        //     o.status = e.status;
        // };

        if ("order_items" in e) {
            for (let item of o.order_items) {
                if (itemId === item.itemId) {
                    if ("quantity" in e.order_items[0]) {
                        item.quantity = e.order_items[0].quantity;
                    };

                    if ("one_qty_price" in e.order_items[0]) {
                        item.one_qty_price = e.order_items[0].one_qty_price;
                    };

                    if ("isTaxable" in e.order_items[0]) {
                        item.isTaxable = e.order_items[0].isTaxable;
                    };

                    if ("imgUrl" in e.order_items[0]) {
                        item.imgUrl = e.order_items[0].imgUrl;
                    };

                    if ("isVeg" in e.order_items[0]) {
                        item.isVeg = e.order_items[0].isVeg;
                    };

                    if ("order_date" in e.order_items[0]) {
                        item.order_date = e.order_items[0].order_date;
                    };
                }
            }
        };

        await o.save();
        SuccessResponse.data = o;
        SuccessResponse.message = "order updated successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// UPDATE ORDER STATUS BY RIDER
const updateOrderStatus = async (req, res) => {
    try {
        let { orderId, riderId } = req.params;
        if (!orderId || !riderId) {
            return res.status(badRequest).send({
                status: false,
                message: 'orderId and riderId is required'
            });
        };

        if (!isValidObjectId(orderId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'orderId is not a valid mongodb id'
            });
        }

        let order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(badRequest).send({
                status: false,
                message: 'order not found'
            });
        };

        order.status = req.body.status;
        await order.save();
        SuccessResponse.data = order;
        SuccessResponse.message = "order status successfully updated by rider";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// DELETE ORDER
const deleteOrder = async (req, res) => {
    try {
        let { orderId } = req.params;
        if (!orderId) {
            return res.status(badRequest).send({
                status: false,
                message: 'order id is required'
            });
        };

        if (!isValidObjectId(orderId)) {
            return res.status(badRequest).send({
                status: false,
                message: 'Invalid order id'
            });
        };

        let deletedOrder = await orderModel.findOneAndDelete({ _id: orderId });
        if (!deletedOrder) {
            return res.status(badRequest).send({
                status: false,
                message: 'Order not found or already deleted'
            });
        };

        SuccessResponse.message = "order deleted successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// GET ALL ORDERS OF A RESTAURANT
const getAllOrdersOfARestaurant = async (req, res) => {
    try {
        let { restaurantId } = req.params;
        if (!restaurantId) {
            return res.status(badRequest).send({
                status: false,
                message: "restaurantId is required",
            });
        };

        let restaurantOrders = await orderModel.find({ restaurant_id: restaurantId });
        SuccessResponse.data = restaurantOrders;
        SuccessResponse.message = "orders fetched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


// GET ALL ORDERS OF A CUSTOMER
const getAllOrdersOfACustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(badRequest).send({
                status: false,
                message: "customerId is required",
            });
        };

        let orders = await orderModel.find({ customer_id: customerId });
        SuccessResponse.data = orders;
        SuccessResponse.message = "orders fetched successfully";
        return res.status(ok).send({SuccessResponse});
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ErrorResponse});
    }
};


module.exports = {
    createOrder,
    getOrder,
    getCompletedOrderList,
    getAllPendingOrders,
    getCancelledOrderList,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getAllOrdersOfARider,
    getAllOrdersOfARestaurant,
    getAllOrdersOfACustomer
};