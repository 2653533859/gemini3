/**
 * Common Utility Functions
 */

// Sleep function for animation delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random array of integers
function generateRandomArray(size = 10, min = 5, max = 100) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Global animation speed control
const SPEEDS = {
    SLOW: 800,
    NORMAL: 300,
    FAST: 100
};

let currentSpeed = SPEEDS.NORMAL;

function setSpeed(speedLevel) {
    if (SPEEDS[speedLevel]) {
        currentSpeed = SPEEDS[speedLevel];
    }
}

function getSpeed() {
    return currentSpeed;
}

export { sleep, generateRandomArray, setSpeed, getSpeed, SPEEDS };
