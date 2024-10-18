const mongoose = require('mongoose');

/**
 * Company Schema
 * @typedef {Object} Company
 * @property {String} companyName - The official name of the company.
 * @property {String} name - A short or common name for the company.
 * @property {String} email - The company's email address.
 * @property {String} password - The company's password (hashed).
 * @property {Boolean} isEmailVerified - Indicates if the company's email is verified.
 * @property {String} phoneNumber - The company's phone number.
 * @property {Boolean} isPhoneNumberVerified - Indicates if the company's phone number is verified.
 * @property {Number} employeeSize - The size of the company's workforce.
 * @property {Date} createdAt - The date when the company was created.
 * @property {Date} updatedAt - The date when the company was last updated.
 */
const companySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/.+@.+\..+/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
        },
        isPhoneNumberVerified: {
            type: Boolean,
            default: false,
        },
        employeeSize: {
            type: Number,
            required: true,
            min: [1, 'Employee size must be at least 1'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Company', companySchema);
