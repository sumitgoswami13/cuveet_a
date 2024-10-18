const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const connectDB = require('./config/db.config');
require('dotenv').config();

/**
 * Server class to initialize and configure an Express server.
 */
class Server {
    /**
     * Creates an instance of the Server class.
     * Initializes Express, sets the port, configures middlewares, routes, and error handling.
     * @param {Object} serviceFactory - The factory responsible for creating services and queues.
     */
    constructor(serviceFactory) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.serviceFactory = serviceFactory;
        this.emailOtpQueue = serviceFactory.getEmailOtpQueue();
        this.phoneOtpQueue = serviceFactory.getPhoneOtpQueue();
        this.middlewares();
        this.routes();
        this.errorHandling();
        this.connectDB();
    }

    /**
     * Configures all middleware used in the server.
     * Includes security, logging, CORS, JSON parsing, URL encoding, and response compression.
     */
    middlewares() {
        this.app.use(helmet());
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(compression());
    }

    /**
     * Configures and initializes all application routes.
     */
    routes() {
        console.log('Routes initialized.');

        // Create an instance of the CompanyController using the service factory.
        const companyController = this.serviceFactory.createCompanyController();

        // Import the router and pass the controller.
        const companyRoutes = require('./routes/company.routes')(companyController);

        // Use the routes in the Express app.
        this.app.use('/api/companies', companyRoutes);
    }

    /**
     * Configures global error handling.
     * Handles 404 errors and other server errors, with detailed error information in development mode.
     */
    errorHandling() {
        this.app.use((req, res, next) => {
            const error = new Error('Not Found');
            error.status = 404;
            next(error);
        });

        this.app.use((error, req, res, next) => {
            const statusCode = error.status || 500;
            const errorMessage = error.message || 'Internal Server Error';
            const errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;

            res.status(statusCode).json({
                status: statusCode,
                message: errorMessage,
                ...(errorDetails && { stack: errorDetails })
            });
        });
    }

    /**
     * Connects to the database.
     */
    async connectDB() {
        await connectDB();
    }

    /**
     * Starts the Express server.
     * Binds and listens for connections on the specified port.
     */
    start() {
        this.app.listen(this.port, () => {
            console.log(`Worker process ${process.pid} running server on port ${this.port}`);
        });
    }
}

module.exports = Server;
