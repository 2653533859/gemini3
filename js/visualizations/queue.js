import { sleep } from '../utils.js';

class QueueViz {
    constructor() {
        this.container = document.getElementById('queue-track');
        this.statusText = document.getElementById('status-text');
        this.queue = [];
        this.maxSize = 7;
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = text;
    }

    highlightLine(lineIds) {
        document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
        if (Array.isArray(lineIds)) {
            lineIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('active');
            });
        }
    }

    async enqueue(value) {
        this.highlightLine(['line-enq']);
        await sleep(200);

        if (this.queue.length >= this.maxSize) {
            this.updateStatus('Queue Overflow! (队列已满)');
            return;
        }

        this.highlightLine(['line-enq-body']);
        this.updateStatus(`Enqueueing ${value}...`);

        // Create element
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.innerText = value;

        this.container.appendChild(item);
        this.queue.push(value);

        await sleep(400); // Wait for slide in
        this.updateStatus(`Item ${value} enqueued.`);
        this.highlightLine([]);
    }

    async dequeue() {
        this.highlightLine(['line-deq']);
        await sleep(200);

        this.highlightLine(['line-deq-check']);
        if (this.queue.length === 0) {
            this.updateStatus('Queue Underflow! (队列为空)');
            await sleep(300);
            this.highlightLine([]);
            return;
        }

        this.highlightLine(['line-deq-body']);
        const value = this.queue[0];
        this.updateStatus(`Dequeueing ${value}...`);

        // Animation: Remove from DOM first child
        const items = this.container.children;
        const headItem = items[0];

        if (headItem) {
            headItem.classList.add('dequeuing');
            await sleep(400);
            // Wait for animation to finish then remove
            this.container.removeChild(headItem);
            this.queue.shift(); // Remove from array
        }

        this.updateStatus(`Item ${value} dequeued.`);
        this.highlightLine([]);
    }

    async peek() {
        this.highlightLine(['line-peek']);
        await sleep(200);

        this.highlightLine(['line-peek-check']);
        if (this.queue.length === 0) {
            this.updateStatus('Queue is empty.');
            this.highlightLine([]);
            return;
        }

        this.highlightLine(['line-peek-body']);
        const value = this.queue[0];
        this.updateStatus(`Head item is ${value}`);

        // Highlight head item visually
        const items = this.container.children;
        const headItem = items[0];
        if (headItem) {
            headItem.style.backgroundColor = 'var(--success-color)';
            await sleep(1000);
            headItem.style.backgroundColor = '';
        }

        this.highlightLine([]);
    }

    clear() {
        this.container.innerHTML = '';
        this.queue = [];
        this.updateStatus('Queue cleared.');
    }
}

// Logic
const viz = new QueueViz();

const btnEnqueue = document.getElementById('btn-enqueue');
const btnDequeue = document.getElementById('btn-dequeue');
const btnPeek = document.getElementById('btn-peek');
const btnClear = document.getElementById('btn-clear');
const inputVal = document.getElementById('input-val');

btnEnqueue.onclick = async () => {
    const val = inputVal.value;
    if (val === '') return;

    toggleButtons(true);
    await viz.enqueue(val);
    toggleButtons(false);

    inputVal.value = Math.floor(Math.random() * 100);
};

btnDequeue.onclick = async () => {
    toggleButtons(true);
    await viz.dequeue();
    toggleButtons(false);
};

btnPeek.onclick = async () => {
    toggleButtons(true);
    await viz.peek();
    toggleButtons(false);
};

btnClear.onclick = () => {
    viz.clear();
};

function toggleButtons(disabled) {
    btnEnqueue.disabled = disabled;
    btnDequeue.disabled = disabled;
    btnPeek.disabled = disabled;
    btnClear.disabled = disabled;
}
