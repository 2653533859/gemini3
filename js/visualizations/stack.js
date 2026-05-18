import { sleep } from '../utils.js';

class StackViz {
    constructor() {
        this.container = document.getElementById('stack-container');
        this.statusText = document.getElementById('status-text');
        this.stack = [];
        this.maxSize = 8;
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

    async highlightItem(index, colorClass = 'active') {
        const items = this.container.children;
        // Since flex-direction is column-reverse, index 0 (bottom) is the last child in DOM? 
        // Wait, flex-direction: column-reverse means the first child in HTML is at the START of the axis (Bottom).
        // Let's verify:
        // HTML: Child1, Child2
        // Display:
        // Child2
        // Child1
        // So index matches array index if we appendChild.
        // Stack: [1, 2] -> LIFO -> 2 is top.
        // If we append 1, then 2. 
        // Child 0 = 1, Child 1 = 2.

        if (items[index]) {
            // Usually we want to highlight the top one. 
            // In column-reverse, visually top is the last element in list.
        }
    }

    async push(value) {
        this.highlightLine(['line-push']);
        await sleep(200);

        if (this.stack.length >= this.maxSize) {
            this.updateStatus('Stack Overflow! (栈已满)');
            return;
        }

        this.highlightLine(['line-push-body']);
        this.updateStatus(`Pushing ${value}...`);

        // Create element
        const item = document.createElement('div');
        item.className = 'stack-item';
        item.innerText = value;

        this.container.appendChild(item);
        this.stack.push(value);

        await sleep(300);
        this.updateStatus(`Item ${value} pushed.`);
        this.highlightLine([]);
    }

    async pop() {
        this.highlightLine(['line-pop']);
        await sleep(200);

        this.highlightLine(['line-pop-check']);
        if (this.stack.length === 0) {
            this.updateStatus('Stack Underflow! (栈为空)');
            await sleep(300);
            this.highlightLine([]);
            return;
        }

        this.highlightLine(['line-pop-body']);
        const value = this.stack[this.stack.length - 1]; // Get value for message
        this.updateStatus(`Popping ${value}...`);

        // Animation
        const items = this.container.children;
        const topItem = items[items.length - 1];

        if (topItem) {
            topItem.classList.add('popping');
            await sleep(400); // Wait for transition
            this.container.removeChild(topItem);
            this.stack.pop();
        }

        this.updateStatus(`Item ${value} popped.`);
        this.highlightLine([]);
    }

    async peek() {
        this.highlightLine(['line-peek']);
        await sleep(200);

        this.highlightLine(['line-peek-check']);
        if (this.stack.length === 0) {
            this.updateStatus('Stack is empty.');
            this.highlightLine([]);
            return;
        }

        this.highlightLine(['line-peek-body']);
        const value = this.stack[this.stack.length - 1];
        this.updateStatus(`Top item is ${value}`);

        // Highlight top item visually
        const items = this.container.children;
        const topItem = items[items.length - 1];
        if (topItem) {
            topItem.style.backgroundColor = 'var(--warning-color)';
            await sleep(1000);
            topItem.style.backgroundColor = ''; // Reset
        }

        this.highlightLine([]);
    }

    clear() {
        this.container.innerHTML = '';
        this.stack = [];
        this.updateStatus('Stack cleared.');
    }
}

// Logic
const viz = new StackViz();

const btnPush = document.getElementById('btn-push');
const btnPop = document.getElementById('btn-pop');
const btnPeek = document.getElementById('btn-peek');
const btnClear = document.getElementById('btn-clear');
const inputVal = document.getElementById('input-val');

btnPush.onclick = async () => {
    const val = inputVal.value;
    if (val === '') return;

    // Disable buttons
    toggleButtons(true);
    await viz.push(val);
    toggleButtons(false);

    // Randomize next input for convenience
    inputVal.value = Math.floor(Math.random() * 100);
};

btnPop.onclick = async () => {
    toggleButtons(true);
    await viz.pop();
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
    btnPush.disabled = disabled;
    btnPop.disabled = disabled;
    btnPeek.disabled = disabled;
    btnClear.disabled = disabled;
}
