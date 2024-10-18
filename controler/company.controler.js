const { validationResult } = require('express-validator');

/**
 * CompanyController class to handle requests for company signup, login, and OTP verification.
 */
class CompanyController {
    /**
     * Creates an instance of the CompanyController.
     * @param {Object} companyService - The service responsible for handling company logic.
     */
    constructor(companyService) {
        this.companyService = companyService;

        // Bind controller methods to `this` to maintain the correct context.
        this.signup = this.signup.bind(this);
        this.verifyEmail = this.verifyEmail.bind(this);
        this.verifyPhone = this.verifyPhone.bind(this);
        this.login = this.login.bind(this);
    }

    /**
     * Handles the signup request for a new company.
     * Validates the input data before passing it to the CompanyService.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async signup(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const result = await this.companyService.signup(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Handles the email verification request.
     * Validates the input data before passing it to the CompanyService.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async verifyEmail(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, otp } = req.body;
        try {
            const result = await this.companyService.verifyEmail(email, otp);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Handles the phone number verification request.
     * Validates the input data before passing it to the CompanyService.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async verifyPhone(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNumber, otp } = req.body;

        try {
            const result = await this.companyService.verifyPhone(phoneNumber, otp);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Handles the login request for a company.
     * Validates the input data before passing it to the CompanyService.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const result = await this.companyService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = CompanyController;
