const express = require('express');
const CompanyValidator = require('../middlewares/validators/company.validator');

/**
 * Creates the routes for company-related endpoints.
 * @param {CompanyController} companyController - The controller that handles company logic.
 * @returns {express.Router} The configured router.
 */
module.exports = (companyController) => {
    const router = express.Router();

    // Define routes with validation rules from CompanyValidator.
    router.post(
        '/signup',
        CompanyValidator.signup(),
        (req, res) => companyController.signup(req, res)
    );

    router.post(
        '/verify-email',
        CompanyValidator.verifyEmail(),
        (req, res) => companyController.verifyEmail(req, res)
    );

    router.post(
        '/verify-phone',
        CompanyValidator.verifyPhone(),
        (req, res) => companyController.verifyPhone(req, res)
    );

    router.post(
        '/login',
        CompanyValidator.login(),
        (req, res) => companyController.login(req, res)
    );

    return router;
};
