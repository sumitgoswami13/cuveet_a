const cluster = require('cluster');
const os = require('os');
const Server = require('./server');
const ServiceFactory = require('./factories/serviceFactory');
const WorkerService = require('./workers//worker.service');

/**
 * The number of worker processes to be spawned.
 * @type {number}
 */
const numWorkers = 1/* os.cpus().length */;

/**
 * Create instances of CustomQueue for email and phone OTP with a concurrency level of 3.
 * These queues will be shared across all worker processes.
 */
const emailOtpQueue = ServiceFactory.getEmailOtpQueue();
const phoneOtpQueue = ServiceFactory.getPhoneOtpQueue();

if (cluster.isMaster) {
    /**
     * Master process logic.
     * Spawns worker processes and listens for worker exit events to respawn if necessary.
     */
    console.log(`Master process ${process.pid} is running`);

    // Spawn worker processes based on the specified number of workers.
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    // Listen for exit events to respawn workers if they crash.
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Respawning...`);
        cluster.fork();
    });
} else {
    /**
     * Worker process logic.
     * Initializes the server and starts the worker service to process tasks from the shared queues.
     */
    console.log(`Worker process ${process.pid} is running`);

    // Create a new server instance using the service factory.
    const server = new Server(ServiceFactory);
    server.start();

    /**
     * Create and start the WorkerService using the shared queues and services.
     * This ensures that all workers use the same queues.
     */
    const workerService = new WorkerService(
        emailOtpQueue,
        phoneOtpQueue,
        ServiceFactory.createEmailService(),
        ServiceFactory.createPhoneOtpService()
    );
    workerService.start();
}
