const os = require("os");
const validator = require('validator');

// Validation functions
const isValidString = (value) => typeof value === 'string' && value.trim().length > 0;

// Validate email
const isValidEmail = (value) => {
    return validator.isEmail(value);
};

// Validate password
const isValidPassword = (value) => {
    // Example password rules:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
};

// Validate Phone Number
const isValidPhoneNumber = (value) => validator.isMobilePhone(value, 'any', { strictMode: true });

// Validate URL
const isValidURL = (value) => validator.isURL(value);

// Validate Postal Code
const isValidPostalCode = (value, locale) => validator.isPostalCode(value, locale);

// Validate Boolean
const isValidBoolean = (value) => typeof value === 'boolean';

// Validate Integer
const isValidInteger = (value) => Number.isInteger(value);

// Validate GST Number
const isValidGSTNumber = (value) => validator.isAlphanumeric(value) && value.length === 15; // Example rule for GST number

// GET CURRENT IP ADDRESS
let getCurrentIPAddress = () => {
    let networkInterfaces = os.networkInterfaces();
    let ipAddress = Object.values(networkInterfaces)
        .flat()
        .filter((iface) => iface.family === "IPv4" && !iface.internal)
        .map((iface) => iface.address)[0];
    return ipAddress;
};

// Generate Random AlphaNumeric ID of given length
function generateRandomAlphaNumericID(length) {
    let id = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }
    return id;
};

// Generate Random Numeric ID of given length
function generateRandomNumericId(length) {
    if (length <= 0) {
        throw new Error("Length must be a positive integer");
    }

    const digits = '0123456789';
    let randomId = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        randomId += digits[randomIndex];
    }

    return randomId;
};

module.exports = {
    isValidString,
    isValidEmail,
    isValidPassword,
    isValidPhoneNumber,
    isValidURL,
    isValidPostalCode,
    isValidBoolean,
    isValidInteger,
    isValidGSTNumber,
    getCurrentIPAddress,
    generateRandomAlphaNumericID,
    generateRandomNumericId
};
