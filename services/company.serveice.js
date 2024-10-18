const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

/**
 * Company class to handle signup, login, OTP verification, and job posting functionalities.
 */
class CompanyService {
    /**
     * @param {mongoose.Model} companyModel - Mongoose model for the company.
     * @param {mongoose.Model} otpModel - Mongoose model for OTPs.
     * @param {Object} emailService - A service for sending emails.
     * @param {Object} phoneOtpService - A service for sending OTPs to phone numbers.
     * @param {Object} tokenService - A service for generating and verifying tokens.
     * @param {CustomQueue} emailOtpQueue - A queue for handling email OTP tasks.
     * @param {CustomQueue} phoneOtpQueue - A queue for handling phone OTP tasks.
     */
    constructor(
        companyModel,
        otpModel,
        emailService,
        phoneOtpService,
        tokenService,
        emailOtpQueue,
        phoneOtpQueue
    ) {
        this.companyModel = companyModel;
        this.otpModel = otpModel;
        this.emailService = emailService;
        this.phoneOtpService = phoneOtpService;
        this.tokenService = tokenService;
        this.emailOtpQueue = emailOtpQueue;
        this.phoneOtpQueue = phoneOtpQueue;
    }

   /**
     * Signs up a new company, generates OTPs for email and phone verification, and queues the OTP sending tasks.
     * @async
     * @param {Object} companyData - The data for the company signup.
     * @param {String} companyData.companyName - The name of the company.
     * @param {String} companyData.email - The email address of the company.
     * @param {String} companyData.password - The password for the company account.
     * @param {String} companyData.phoneNumber - The phone number of the company.
     * @param {Number} companyData.employeeSize - The size of the company's workforce.
     * @returns {Promise<Object>} The result of the signup process, including a message to verify email and phone.
     * @throws {Error} If signup fails or a company with the given email already exists.
     */
   async signup(companyData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { companyName, email, password, phoneNumber, employeeSize } = companyData;
        const existingCompany = await this.companyModel.findOne({ email }).session(session);

        if (existingCompany) {
            throw new Error('Email is already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const newCompany = new this.companyModel({
            companyName,
            email,
            password: hashedPassword,
            phoneNumber,
            employeeSize,
            isEmailVerified: false,
            isPhoneNumberVerified: false,
        });

        await newCompany.save({ session });

        const emailOtpRecord = new this.otpModel({
            companyId: newCompany._id,
            otp: emailOtp,
            expiresAt: otpExpiration,
            type: 'email',
        });

        const phoneOtpRecord = new this.otpModel({
            companyId: newCompany._id,
            otp: phoneOtp,
            expiresAt: otpExpiration,
            type: 'phone',
        });

        await emailOtpRecord.save({ session });
        await phoneOtpRecord.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Enqueue the email OTP sending task
        // Enqueue the email OTP sending task with logging
        this.emailOtpQueue.enqueue({
            to: email,
            subject: 'Verify Your Email',
            text: `Your OTP for email verification is: ${emailOtp}. This OTP is valid for 10 minutes.`,
        });

        // Enqueue the phone OTP task with necessary data
        this.phoneOtpQueue.enqueue({
            to: phoneNumber,
            message: `Your OTP for phone verification is: ${phoneOtp}. This OTP is valid for 10 minutes.`,
        });

        return { message: 'Signup successful, please verify your email and phone with the OTPs sent to you.' };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Signup failed: ${error.message}`);
    }
}

    /**
     * Verifies the email using the provided OTP.
     * @param {String} email - The email to verify.
     * @param {String} otp - The OTP sent to the email.
     * @returns {Promise<Object>} The verification result.
     * @throws {Error} If the OTP is invalid or expired.
     */
    async verifyEmail(email, otp) {
        try {
            const company = await this.companyModel.findOne({ email });
            if (!company) {
                throw new Error('Company not found');
            }

            const otpRecord = await this.otpModel.findOne({ companyId: company._id });
            if (!otpRecord || otpRecord.emailOtp !== otp || new Date() > otpRecord.emailExpiresAt) {
                throw new Error('Invalid or expired OTP');
            }

            company.isEmailVerified = true;
            await company.save();

            otpRecord.emailOtp = undefined;
            otpRecord.emailExpiresAt = undefined;
            await otpRecord.save();

            return { message: 'Email verified successfully' };
        } catch (error) {
            throw new Error(`Verification failed: ${error.message}`);
        }
    }

    /**
     * Verifies the phone number using the provided OTP.
     * @param {String} phoneNumber - The phone number to verify.
     * @param {String} otp - The OTP sent to the phone number.
     * @returns {Promise<Object>} The verification result.
     * @throws {Error} If the OTP is invalid, expired, or the phone number is not found.
     */
    async verifyPhone(phoneNumber, otp) {
        try {
            const company = await this.companyModel.findOne({ phoneNumber });
            if (!company) {
                throw new Error('Company not found');
            }

            const otpRecord = await this.otpModel.findOne({ companyId: company._id });
            if (!otpRecord || otpRecord.phoneOtp !== otp || new Date() > otpRecord.phoneExpiresAt) {
                throw new Error('Invalid or expired OTP');
            }

            company.isPhoneNumberVerified = true;
            await company.save();

            otpRecord.phoneOtp = undefined;
            otpRecord.phoneExpiresAt = undefined;
            await otpRecord.save();

            return { message: 'Phone number verified successfully' };
        } catch (error) {
            throw new Error(`Phone verification failed: ${error.message}`);
        }
    }

    /**
     * Logs in a company and returns a JWT token and refresh token.
     * @param {String} email - The email of the company.
     * @param {String} password - The password of the company.
     * @returns {Promise<Object>} The login result with JWT tokens.
     * @throws {Error} If login fails due to incorrect credentials or unverified email.
     */
    async login(email, password) {
        try {
            const company = await this.companyModel.findOne({ email });
            if (!company) {
                throw new Error('Company not found');
            }

            const isPasswordValid = await bcrypt.compare(password, company.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            if (!company.isEmailVerified) {
                throw new Error('Please verify your email before logging in');
            }

            const accessToken = this.tokenService.generateAccessToken(company);
            const refreshToken = this.tokenService.generateRefreshToken(company);

            company.refreshToken = refreshToken;
            await company.save();

            return { message: 'Login successful', accessToken, refreshToken };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }
}

module.exports = CompanyService;
