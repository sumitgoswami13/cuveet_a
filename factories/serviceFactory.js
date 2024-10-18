const emailService = require('../utils/email.service');
const phoneOtpService = require('../utils/phoneOtp.service');
const CustomQueue = require('../queue/queue');
const CompanyService = require('../services/company.serveice');
const CompanyController = require('../controler/company.controler');
const tokenService = require('../utils/token.service');
const Company = require('../model/company.model');
const Otp = require('../model/otp.model');

class ServiceFactory {
    static emailOtpQueue = null;
    static phoneOtpQueue = null;

    /**
     * Initializes and returns a shared email OTP queue.
     * @returns {CustomQueue} The shared email OTP queue.
     */
    static getEmailOtpQueue() {
        if (!this.emailOtpQueue) {
            this.emailOtpQueue = new CustomQueue(3);
        }
        return this.emailOtpQueue;
    }

    /**
     * Initializes and returns a shared phone OTP queue.
     * @returns {CustomQueue} The shared phone OTP queue.
     */
    static getPhoneOtpQueue() {
        if (!this.phoneOtpQueue) {
            this.phoneOtpQueue = new CustomQueue(3);
        }
        return this.phoneOtpQueue;
    }

    /**
     * Returns the email service.
     * @returns {Object} The email service.
     */
    static createEmailService() {
        return emailService;
    }

    /**
     * Returns the phone OTP service.
     * @returns {Object} The phone OTP service.
     */
    static createPhoneOtpService() {
        return phoneOtpService;
    }

    /**
     * Creates and returns an instance of the CompanyService.
     * @returns {CompanyService} An instance of the CompanyService.
     */
    static createCompanyService() {
        const emailOtpQueue = this.getEmailOtpQueue();
        const phoneOtpQueue = this.getPhoneOtpQueue();

        return new CompanyService(
            Company,
            Otp,
            this.createEmailService(),
            this.createPhoneOtpService(),
            tokenService,
            emailOtpQueue,
            phoneOtpQueue
        );
    }

    /**
     * Creates and returns an instance of the CompanyController.
     * @returns {CompanyController} An instance of the CompanyController.
     */
    static createCompanyController() {
        const companyService = this.createCompanyService();
        return new CompanyController(companyService);
    }
}

module.exports = ServiceFactory;
