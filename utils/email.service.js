const nodemailer = require('nodemailer');

/**
 * EmailService class to handle email sending using nodemailer.
 */
class EmailService {
    /**
     * Creates an instance of the EmailService.
     * Initializes the nodemailer transporter using environment variables.
     */
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER, // Your Gmail address
                pass: process.env.SMTP_PASSWORD, // Your App Password (generated from Google)
            },
        });
    }
    /**
     * Sends an email with the specified options.
     * @async
     * @param {Object} mailOptions - The email options.
     * @param {string} mailOptions.to - Recipient's email address.
     * @param {string} mailOptions.subject - Subject of the email.
     * @param {string} mailOptions.text - Plain text content of the email.
     * @param {string} [mailOptions.html] - HTML content of the email (optional).
     * @returns {Promise<Object>} The result of the email sending.
     * @throws {Error} If the email sending fails.
     */
    async sendEmail({ to, subject, text, html }) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM_EMAIL || 'no-reply@example.com',
                to,
                subject,
                text,
                html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}

module.exports = new EmailService();
