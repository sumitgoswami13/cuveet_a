const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * TokenService class to handle JWT generation, verification, and decoding.
 */
class TokenService {
    /**
     * Generates an access token for the given payload.
     * @param {Object} payload - The payload to encode in the token.
     * @param {string} [expiresIn='1h'] - The expiration time for the token (e.g., '1h', '7d').
     * @returns {string} The generated JWT access token.
     */
    generateAccessToken(payload, expiresIn = '1h') {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    }

    /**
     * Generates a refresh token for the given payload.
     * @param {Object} payload - The payload to encode in the token.
     * @param {string} [expiresIn='7d'] - The expiration time for the refresh token.
     * @returns {string} The generated JWT refresh token.
     */
    generateRefreshToken(payload, expiresIn = '7d') {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
    }

    /**
     * Verifies a JWT and returns the decoded payload.
     * @param {string} token - The JWT to verify.
     * @returns {Object} The decoded payload if the token is valid.
     * @throws {Error} If the token is invalid or expired.
     */
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    /**
     * Verifies a refresh token and returns the decoded payload.
     * @param {string} token - The refresh token to verify.
     * @returns {Object} The decoded payload if the token is valid.
     * @throws {Error} If the token is invalid or expired.
     */
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Decodes a JWT without verifying its signature.
     * Useful for extracting data without validating the token.
     * @param {string} token - The JWT to decode.
     * @returns {Object} The decoded payload.
     */
    decodeToken(token) {
        return jwt.decode(token);
    }
}

module.exports = new TokenService();
