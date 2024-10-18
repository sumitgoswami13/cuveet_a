const { body } = require('express-validator');

/**
 * CompanyValidator class to handle validation rules for company-related operations.
 */
class CompanyValidator {
    /**
     * Validation rules for the signup process.
     * @returns {Array} An array of validation chains.
     */
    static signup() {
        return [
            body('companyName').notEmpty().withMessage('Company name is required'),
            body('email').isEmail().withMessage('Valid email is required'),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
            body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
            body('employeeSize').isInt({ min: 1 }).withMessage('Employee size must be a positive integer'),
        ];
    }
    /**
     * Validation rules for verifying an email.
     * @returns {Array} An array of validation chains.
     */
    static verifyEmail() {
        return [
            body('email').isEmail().withMessage('Valid email is required'),
            body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        ];
    }

    /**
     * Validation rules for verifying a phone number.
     * @returns {Array} An array of validation chains.
     */
    static verifyPhone() {
        return [
            body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
            body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        ];
    }

    /**
     * Validation rules for the login process.
     * @returns {Array} An array of validation chains.
     */
    static login() {
        return [
            body('email').isEmail().withMessage('Valid email is required'),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        ];
    }
}

module.exports = CompanyValidator;
