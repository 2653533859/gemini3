import { generateRandomArray, sleep } from '../utils.js';

class BinarySearchViz {
    constructor() {
        this.container = document.getElementById('bs-bar-container');
        this.statusText = document.getElementById('status-text');
        this.array = [];
        this.bars = [];

        // Render Pointers
        this.ptrLow = this.createPointer('L', 'ptr-low');
        this.ptrHigh = this.createPointer('H', 'ptr-high');
        this.ptrMid = this.createPointer('M', 'ptr-mid');

        this.container.appendChild(this.ptrLow);
        this.container.appendChild(this.ptrHigh);
        this.container.appendChild(this.ptrMid);

        this.hidePointers();
    }

    createPointer(label, id) {
        const ptr = document.createElement('div');
        ptr.id = id;
        ptr.className = 'pointer';
        ptr.style.opacity = '0'; // hidden by default

        const lbl = document.createElement('div');
        lbl.className = 'pointer-label';
        lbl.innerText = label;

        const arrow = document.createElement('div');
        arrow.className = 'pointer-arrow';
        if (id === 'ptr-mid') arrow.style.borderTopColor = 'var(--warning-color)';

        ptr.appendChild(lbl);
        ptr.appendChild(arrow);
        return ptr;
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = text;
    }

    highlightLine(lineNums) {
        document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
        if (Array.isArray(lineNums)) {
            lineNums.forEach(n => {
                const el = document.getElementById(`line-${n}`);
                if (el) el.classList.add('active');
            });
        }
    }

    init(array) {
        // Sort the array for binary search
        this.array = array.sort((a, b) => a - b);
        this.render();
        this.updateStatus('有序数组已生成。请输入目标值并开始查找。');
    }

    render() {
        // Clear bars but keep pointers (Wait, pointers are children of container, need to preserve or re-append)
        // Easier to re-clear everything and append.
        this.container.innerHTML = '';
        this.container.appendChild(this.ptrLow);
        this.container.appendChild(this.ptrHigh);
        this.container.appendChild(this.ptrMid);

        this.bars = [];

        this.array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.className = 'bs-bar';
            bar.style.height = `${val * 3}px`;

            const label = document.createElement('div');
            label.className = 'bs-val';
            label.innerText = val;
            bar.appendChild(label);

            this.container.appendChild(bar);
            this.bars.push(bar);
        });

        this.hidePointers();
    }

    movePointer(ptr, index) {
        if (index < 0 || index >= this.bars.length) return;

        // Calculate position
        // Bars have gap 4px. Width 40px.
        // Left offset = index * (40 + 4)
        const offset = index * 44;

        ptr.style.left = `${offset}px`;
        ptr.style.opacity = '1';
    }

    hidePointers() {
        this.ptrLow.style.opacity = '0';
        this.ptrHigh.style.opacity = '0';
        this.ptrMid.style.opacity = '0';
    }

    dimRange(start, end) {
        // dimmed class means "not in search range"
        // Wait, logic is easier: dim everything OUTSIDE [start, end]
        this.bars.forEach((bar, idx) => {
            if (idx < start || idx > end) {
                bar.classList.add('dimmed');
            } else {
                bar.classList.remove('dimmed');
            }
        });
    }

    async search(target) {
        this.resetVisuals();

        let low = 0;
        let high = this.array.length - 1;

        this.highlightLine([2, 3]);
        this.updateStatus(`Low: ${low}, High: ${high}`);
        this.movePointer(this.ptrLow, low);
        this.movePointer(this.ptrHigh, high);
        await sleep(500);

        while (low <= high) {
            this.highlightLine([5]);
            this.dimRange(low, high); // Dim everything outside current scope
            await sleep(500);

            const mid = Math.floor((low + high) / 2);
            this.highlightLine([6]);
            this.movePointer(this.ptrMid, mid);
            this.bars[mid].classList.add('mid');
            this.updateStatus(`计算 Middle索引: (${low} + ${high}) // 2 = ${mid}, 值: ${this.array[mid]}`);
            await sleep(800);

            this.highlightLine([7]);
            if (this.array[mid] == target) {
                this.updateStatus(`找到目标值 ${target} 在索引 ${mid}！`);
                this.bars[mid].classList.remove('mid');
                this.bars[mid].classList.add('found');
                this.highlightLine([8]);
                return;
            } else if (this.array[mid] < target) {
                this.updateStatus(`${this.array[mid]} < ${target}，目标在右侧，忽略左半部分。`);
                this.highlightLine([9, 10]);
                low = mid + 1;
                this.movePointer(this.ptrLow, low);
                this.ptrMid.style.opacity = '0'; // Hide mid temporarily
                this.bars[mid].classList.remove('mid');
                await sleep(800);
            } else {
                this.updateStatus(`${this.array[mid]} > ${target}，目标在左侧，忽略右半部分。`);
                this.highlightLine([11, 12]);
                high = mid - 1;
                this.movePointer(this.ptrHigh, high);
                this.ptrMid.style.opacity = '0';
                this.bars[mid].classList.remove('mid');
                await sleep(800);
            }
        }

        this.highlightLine([14]);
        this.updateStatus(`未找到目标值 ${target}`);
        this.dimRange(-1, -1); // Dim all
    }

    resetVisuals() {
        this.bars.forEach(b => {
            b.className = 'bs-bar';
        });
        this.hidePointers();
    }
}

// Logic
const viz = new BinarySearchViz();
let array = generateRandomArray(15, 5, 99).sort((a, b) => a - b);
viz.init(array);

const btnStart = document.getElementById('btn-start');
const btnGenerate = document.getElementById('btn-generate');
const btnReset = document.getElementById('btn-reset'); // Actually reset view
const inputTarget = document.getElementById('input-target');

btnGenerate.onclick = () => {
    array = generateRandomArray(15, 5, 99).sort((a, b) => a - b);
    viz.init(array);
    inputTarget.value = '';
};

btnStart.onclick = async () => {
    const val = parseInt(inputTarget.value);
    if (isNaN(val)) {
        // Pick a random one for them if empty
        const randomTarget = array[Math.floor(Math.random() * array.length)];
        inputTarget.value = randomTarget;
        return;
    }

    btnStart.disabled = true;
    btnGenerate.disabled = true;

    await viz.search(val);

    btnStart.disabled = false;
    btnGenerate.disabled = false;
};

btnReset.onclick = () => {
    viz.resetVisuals();
    viz.dimRange(0, array.length - 1); // un-dim all
};
