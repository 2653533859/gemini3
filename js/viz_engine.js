import { sleep, getSpeed } from './utils.js';

/**
 * Base Visualization Engine
 * Handles rendering of array bars and basic animation states.
 */
export class VizEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.array = [];
        this.bars = [];
        this.isPaused = false;
        this.isStopped = false;
    }

    // Initialize the visualization with a data array
    init(array) {
        this.array = [...array];
        this.render();
    }

    // Render the current state of the array
    render() {
        this.container.innerHTML = '';
        this.bars = [];

        this.array.forEach(value => {
            const bar = document.createElement('div');
            bar.className = 'viz-bar';
            bar.style.height = `${value * 3}px`; // Scale factor

            // Add value label
            /* 
            const label = document.createElement('div');
            label.className = 'viz-val';
            label.innerText = value;
            bar.appendChild(label);
            */

            this.container.appendChild(bar);
            this.bars.push(bar);
        });
    }

    // Highlight elements to show comparison (Yellow)
    async highlight(indices, colorClass = 'compare') {
        indices.forEach(i => {
            if (this.bars[i]) this.bars[i].classList.add(colorClass);
        });
        await this.wait();
        indices.forEach(i => {
            if (this.bars[i]) this.bars[i].classList.remove(colorClass);
        });
    }

    // Visualize swapping two elements (Red)
    async swap(i, j) {
        // Highlight logic
        this.bars[i].classList.add('swap');
        this.bars[j].classList.add('swap');

        await this.wait();

        // Perform swap in DOM (visual height)
        let tempH = this.bars[i].style.height;
        this.bars[i].style.height = this.bars[j].style.height;
        this.bars[j].style.height = tempH;

        // Perform swap in data
        let temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;

        await this.wait();

        this.bars[i].classList.remove('swap');
        this.bars[j].classList.remove('swap');
    }

    // Mark an element as sorted (Green)
    markSorted(index) {
        if (this.bars[index]) {
            this.bars[index].classList.add('sorted');
        }
    }

    // Mark a range as sorted
    markAllSorted() {
        this.bars.forEach(bar => bar.classList.add('sorted'));
    }

    // Clear all status classes
    clearColors() {
        this.bars.forEach(bar => {
            bar.className = 'viz-bar';
        });
    }

    // Internal wait based on current speed
    async wait() {
        if (this.isStopped) throw new Error('Stopped');

        // Handling pause mechanism
        while (this.isPaused) {
            await sleep(100);
            if (this.isStopped) throw new Error('Stopped');
        }

        await sleep(getSpeed());
    }

    // Control methods
    pause() { this.isPaused = true; }
    resume() { this.isPaused = false; }
    stop() { this.isStopped = true; }
    reset() {
        this.isStopped = false;
        this.isPaused = false;
        this.clearColors();
    }
    // Highlight a line of code in the code panel
    highlightCode(lineId) {
        // Remove active class from all code lines
        const lines = document.querySelectorAll('.code-line');
        lines.forEach(l => l.classList.remove('active'));

        // Add active class to target line
        const el = document.getElementById(lineId);
        if (el) {
            el.classList.add('active');
            // Auto-scroll to line
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Update status text
    updateStatus(message) {
        const el = document.getElementById('status-text');
        if (el) {
            el.innerText = message;
        }
    }
}
