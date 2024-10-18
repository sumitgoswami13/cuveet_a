const mongoose = require('mongoose');

/**
 * Otp Schema
 * @typedef {Object} Otp
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the OTP.
 * @property {String} otp - The OTP code.
 * @property {Date} expiresAt - The time when the OTP will expire.
 * @property {String} type - The type of OTP, either 'email' or 'phone'.
 */
const otpSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            enum: ['email', 'phone'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Otp', otpSchema);
