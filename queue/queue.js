const EventEmitter = require('events');

class CustomQueue extends EventEmitter {
    /**
     * Creates an instance of CustomQueue.
     * @param {number} concurrency - The number of tasks to process concurrently.
     */
    constructor(concurrency = 5) {
        super();
        this.queue = [];
        this.concurrency = concurrency;
        this.activeTasks = 0;
    }

    /**
     * Adds a new task to the queue.
     * @param {Function} task - A function representing the task to be executed.
     */
    enqueue(task) {
        this.queue.push(task);
        this.emit('taskAdded'); // Emit an event when a new task is added.
    }

    /**
     * Removes and returns the next task from the queue.
     * @returns {Function|null} The next task from the queue or null if the queue is empty.
     */
    dequeue() {
        return this.queue.length > 0 ? this.queue.shift() : null;
    }

    /**
     * Checks if the queue can process more tasks.
     * @returns {boolean} True if more tasks can be processed, false otherwise.
     */
    canProcessMore() {
        return this.activeTasks < this.concurrency;
    }

    /**
     * Marks a task as started.
     */
    startTask() {
        this.activeTasks += 1;
    }

    /**
     * Marks a task as completed.
     */
    completeTask() {
        this.activeTasks = Math.max(0, this.activeTasks - 1);
    }
}

module.exports = CustomQueue;
