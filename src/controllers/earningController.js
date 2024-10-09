const earningModel = require("../models/earningModel");
const deliveryModel = require("../models/deliveryModel");
const { badRequest, ok, internalServerError } = require('../uitls/statusCodes');

// CREATE EARNING DATA
const createEarning = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        if (!deliveryId) {
            return res.status(badRequest).send({
                status: false,
                message: "deliveryId is required",
            });
        }

        if (!isValidObjectId(deliveryId)) {
            return res.status(badRequest).send({
                status: false,
                message: "Invalid deliveryId",
            });
        }

        let delivery = await deliveryModel.findById(deliveryId);
        if (!delivery) {
            return res.status(badRequest).send({
                status: false,
                message: "No delivery found with given delivery id",
            });
        }

        let { riderId, orderId, earning_amount } = req.body;
        let earningData = { deliveryId, riderId, orderId, earning_amount };
        let newEarning = await earningModel.create(earningData);
        SuccessResponse.data = newEarning;
        SuccessResponse.message = "Rider earning added successfully";
        return res.status(ok).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};

// GET EARNING LIST
const getAllEarning = async (req, res) => {
    try {
        let allDeliveries = await earningModel.find({});
        let totalEarning = 0;
        for (let ele of allDeliveries) {
            totalEarning += ele.earning_amount;
        }
        let data = { allDeliveries, totalEarning };
        SuccessResponse.data = data;
        SuccessResponse.message = "All rider's earning fetched successfully";
        return res.status(ok).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};

// GET ALL EARNING OF A RIDER
const getAllEarningOfARider = async (req, res) => {
    try {
        let { riderId } = req.params;
        if (!riderId) {
            return res.status(badRequest).send({
                status: false,
                message: "Rider Id is required",
            });
        }
        let riderDeliveries = await earningModel.find({ riderId });
        let totalEarning = 0;
        for (let ele of riderDeliveries) {
            totalEarning += ele.earning_amount;
        }
        let data = { riderDeliveries, totalEarning };
        SuccessResponse.data = data;
        SuccessResponse.message = "Rider earning fetched successfully";
        return res.status(ok).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};

// GET RIDER ONE DAY EARNING
const getRiderOneDayEarning = async (req, res) => {
    try {
        let { riderId } = req.params;
        let date;
        if (req.params.date) {
            date = new Date(req.params.date);
        } else {
            date = new Date(); // Use today's date if no date is provided
        }
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        let deliveries = await earningModel.find({
            riderId,
            createdAt: { $gte: startDate, $lt: endDate },
        });

        let grandTotal = 0;
        for (let ele of deliveries) {
            grandTotal += ele.earning_amount;
        };
        let data = { oneDayDeliveries: deliveries, oneDayEarning: grandTotal };
        SuccessResponse.data = data;
        SuccessResponse.message = "Rider's one day earning fetched successfully";
        return res.status(ok).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// GET ONE MONTH EARNING OF A RIDER
const getRiderOneMonthEarning = async (req, res) => {
    try {
        let { riderId } = req.params;
        let date;
        if (req.params.date) {
            date = new Date(req.params.date);
        } else {
            date = new Date(); // Use today's date if no date is provided
        }

        // Set the start date as the first day of the month
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);

        // Set the end date as the first day of the next month
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);

        // Find all deliveries within the start and end date
        let deliveries = await earningModel.find({
            riderId,
            createdAt: { $gte: startDate, $lt: endDate },
        });

        // Calculate the total earnings for the month
        let grandTotal = 0;
        for (let ele of deliveries) {
            grandTotal += ele.earning_amount;
        }

        // Prepare the response data
        let data = { oneMonthDeliveries: deliveries, oneMonthEarning: grandTotal };
        SuccessResponse.data = data;
        SuccessResponse.message = "Rider's one month earning fetched successfully";
        return res.status(ok).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// GET RIDER ONE YEAR EARNING
const getRiderOneYearEarning = async (req, res) => {
    try {
        let { riderId } = req.params;
        let date;
        if (req.params.date) {
            date = new Date(req.params.date);
        } else {
            date = new Date(); // Use today's date if no date is provided
        }

        // Set the start date as the first day of the year
        const startDate = new Date(date.getFullYear(), 0, 1);

        // Set the end date as the first day of the next year
        const endDate = new Date(date.getFullYear() + 1, 0, 1);

        // Find all deliveries within the start and end date
        let deliveries = await earningModel.find({
            riderId,
            createdAt: { $gte: startDate, $lt: endDate },
        });

        // Calculate the total earnings for the year
        let grandTotal = 0;
        for (let ele of deliveries) {
            grandTotal += ele.earning_amount;
        }

        // Prepare the response data
        let data = { oneYearDeliveries: deliveries, oneYearEarning: grandTotal };
        SuccessResponse.data = data;
        SuccessResponse.message = "Rider's one year earning fetched successfully";
        return res.status(ok).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


// GET RIDER ONE WEEK EARNING
const getRiderOneWeekEarning = async (req, res) => {
    try {
        let { riderId } = req.params;
        let date;
        if (req.params.date) {
            date = new Date(req.params.date);
        } else {
            date = new Date(); // Use today's date if no date is provided
        }

        // Set the start date to the beginning of the week (e.g., Sunday or Monday)
        const startDate = new Date(date);
        const dayOfWeek = startDate.getDay(); // Get the day of the week (0 - Sunday, 6 - Saturday)
        const diffToStartOfWeek = dayOfWeek === 0 ? 0 : dayOfWeek; // Adjust to get to Monday (or keep Sunday if preferred)
        startDate.setDate(startDate.getDate() - diffToStartOfWeek); // Move to the start of the week

        // Set the end date to 7 days after the start of the week
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);

        // Find all deliveries within the start and end date
        let deliveries = await earningModel.find({
            riderId,
            createdAt: { $gte: startDate, $lt: endDate },
        });

        // Calculate the total earnings for the week
        let grandTotal = 0;
        for (let ele of deliveries) {
            grandTotal += ele.earning_amount;
        }

        // Prepare the response data
        let data = { oneWeekDeliveries: deliveries, oneWeekEarning: grandTotal };
        SuccessResponse.data = data;
        SuccessResponse.message = "Rider's one week earning fetched successfully";
        return res.status(ok).send({ SuccessResponse });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(internalServerError).send({ ErrorResponse });
    }
};


module.exports = {
    createEarning,
    getAllEarning,
    getAllEarningOfARider,
    getRiderOneDayEarning,
    getRiderOneWeekEarning,
    getRiderOneMonthEarning,
    getRiderOneYearEarning
};
