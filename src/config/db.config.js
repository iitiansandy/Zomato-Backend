const mongoose = require('mongoose');
const { mongoDbUrl } = require('./config');

async function connectToDB () {
    try {
        await mongoose.connect(mongoDbUrl);
    } catch (error) {
        console.log("Unable to connect to database");
        return error;
    }
};

module.exports = { connectToDB };
