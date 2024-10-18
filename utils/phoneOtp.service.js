const twilio = require('twilio');

/**
 * PhoneOtpService class to handle OTP sending using Twilio.
 */
class PhoneOtpService {
    /**
     * Creates an instance of the PhoneOtpService.
     * Initializes the Twilio client using environment variables.
     */
    constructor() {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    }

    /**
     * Sends an OTP to the specified phone number.
     * @async
     * @param {Object} options - The OTP options.
     * @param {string} options.to - The recipient's phone number.
     * @param {string} options.message - The message containing the OTP.
     * @returns {Promise<Object>} The result of the OTP sending.
     * @throws {Error} If the OTP sending fails.
     */
    async sendOtp({ to, message }) {
        try {
            console.log(to,message)
            const result = await this.client.messages.create({
                body: message,
                from: this.fromPhoneNumber,
                to,
            });

            console.log('OTP sent successfully:', result.sid);
            return result;
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw new Error('Failed to send OTP');
        }
    }
}

module.exports = new PhoneOtpService();
