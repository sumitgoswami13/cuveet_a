class WorkerService {
    /**
     * @param {CustomQueue} emailOtpQueue - The queue for handling email OTP tasks.
     * @param {CustomQueue} phoneOtpQueue - The queue for handling phone OTP tasks.
     * @param {Object} emailService - The service responsible for sending emails.
     * @param {Object} phoneOtpService - The service responsible for sending OTPs to phone numbers.
     */
    constructor(emailOtpQueue, phoneOtpQueue, emailService, phoneOtpService) {
        this.emailOtpQueue = emailOtpQueue;
        this.phoneOtpQueue = phoneOtpQueue;
        this.emailService = emailService;
        this.phoneOtpService = phoneOtpService;
        // Bind event listeners
        this.bindEventListeners();
    }

    /**
     * Binds the event listeners for task processing.
     */
    bindEventListeners() {
        this.emailOtpQueue.on('taskAdded', () => this.processEmailQueue());
        this.phoneOtpQueue.on('taskAdded', () => this.processPhoneQueue());
    }

    /**
     * Starts the worker service.
     */
    start() {
        console.log('Worker Service started and waiting for tasks...');
    }

    /**
     * Processes tasks from the email OTP queue if available.
     */
    /**
 * Processes tasks from the email OTP queue if available.
 */
    async processEmailQueue() {
        if (this.emailOtpQueue.canProcessMore()) {
            const task = this.emailOtpQueue.dequeue();
            if (task) {
                console.log('Processing email OTP task:', task); // Log the task data before processing
                this.emailOtpQueue.startTask();
                await this.processTask(task, this.emailService, 'sendEmail');
                this.emailOtpQueue.completeTask();
            }
        }
    }

    /**
     * Processes tasks from the phone OTP queue if available.
     */
    async processPhoneQueue() {
        if (this.phoneOtpQueue.canProcessMore()) {
            const task = this.phoneOtpQueue.dequeue();
            if (task) {
                console.log('Processing phone OTP task:', task); // Log the task data before processing
                this.phoneOtpQueue.startTask();
                await this.processTask(task, this.phoneOtpService, 'sendOtp');
                this.phoneOtpQueue.completeTask();
            }
        }
    }


    /**
     * Processes a single task using the specified service and method.
     * @param {Function} task - The task to process.
     * @param {Object} service - The service that will process the task.
     * @param {String} method - The method name to be invoked on the service.
     */
    async processTask(task, service, method) {
        try {
            console.log(`Processing task for ${method}...`);
            await service[method](task);
            console.log(`Task for ${method} completed successfully.`);
        } catch (error) {
            console.error(`Error processing task for ${method}:`, error);
        }
    }
}

module.exports = WorkerService;
