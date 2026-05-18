import { VizEngine } from '../viz_engine.js';
import { generateRandomArray, setSpeed } from '../utils.js';

class InsertionSortViz extends VizEngine {
    constructor() {
        super('viz-canvas');
        this.statusText = document.getElementById('status-text');
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

    async run() {
        this.updateStatus('开始插入排序...');
        this.highlightLine([1]);
        await this.wait();

        const n = this.array.length;
        this.highlightLine([2]);
        this.markSorted(0); // Assume first element is sorted
        await this.wait();

        for (let i = 1; i < n; i++) {
            this.highlightLine([4]);
            this.updateStatus(`第 ${i} 轮：处理元素 ${this.array[i]}`);
            await this.wait();

            let key = this.array[i];
            let j = i - 1;

            // Highlight key (maybe blue?)
            this.bars[i].classList.add('compare'); // Use compare color for now
            this.highlightLine([5, 6]);
            await this.wait();

            // Store the key visually (maybe lift it? for now just highlight)

            this.highlightLine([9]);
            while (j >= 0) {
                // Highlight comparison
                this.bars[j].classList.add('compare');
                await this.wait();

                if (this.array[j] > key) {
                    this.updateStatus(`${this.array[j]} > ${key}, 向后移动`);
                    this.highlightLine([10]);

                    // We need to overwrite array[j+1] with array[j]
                    // Visual 'swap' isn't quite right for insertion sort, but we can simulate 'move'.
                    // Actually, let's swap for visual simplicity or implement overwrite? 
                    // To follow the code exactly: arr[j+1] = arr[j]

                    // Visual overwrite:
                    this.bars[j + 1].style.height = this.bars[j].style.height;
                    this.array[j + 1] = this.array[j]; // Update data

                    // Visualize the "empty" or duplicate spot?
                    // Let's just animate the move

                    this.bars[j].classList.remove('compare');
                    this.bars[j].classList.add('swap'); // Color the one that moved

                    await this.wait();
                    this.bars[j].classList.remove('swap');

                    j--;
                    this.highlightLine([11]);
                } else {
                    this.bars[j].classList.remove('compare');
                    break;
                }
            }

            // Insert key
            this.updateStatus(`在位置 ${j + 1} 插入 ${key}`);
            this.highlightLine([14]);

            this.array[j + 1] = key;
            this.bars[j + 1].style.height = `${key * 3}px`;

            // Remove initial key highlight (from original position i, but i might be overwritten)
            // It's tricky because we overwrote visualized bars.
            // We should just clear all colors
            this.clearColors();

            // Mark 0..i as sorted
            for (let k = 0; k <= i; k++) this.markSorted(k);

            await this.wait();
        }

        this.markAllSorted();
        this.updateStatus('排序完成！');
        this.highlightLine([]);
    }
}

// Controller Logic
const viz = new InsertionSortViz();
let array = generateRandomArray(15, 10, 180);
viz.init(array);

const btnStart = document.getElementById('btn-start');
const btnGenerate = document.getElementById('btn-generate');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const selectSpeed = document.getElementById('select-speed');

let isRunning = false;

btnGenerate.onclick = () => {
    if (isRunning) return;
    array = generateRandomArray(15, 10, 180);
    viz.reset();
    viz.init(array);
};

btnStart.onclick = async () => {
    if (isRunning) return;

    if (viz.isPaused) {
        viz.resume();
        btnPause.innerText = '暂停';
        btnPause.disabled = false;
        return;
    }

    isRunning = true;
    btnStart.disabled = true;
    btnGenerate.disabled = true;
    btnPause.disabled = false;

    try {
        await viz.run();
    } catch (e) {
        console.log('Stopped/Reset');
    }

    isRunning = false;
    btnStart.disabled = false;
    btnGenerate.disabled = false;
    btnPause.disabled = true;
    btnPause.innerText = '暂停';
};

btnPause.onclick = () => {
    if (viz.isPaused) {
        viz.resume();
        btnPause.innerText = '暂停';
    } else {
        viz.pause();
        btnPause.innerText = '继续';
    }
};

btnReset.onclick = () => {
    viz.stop();
    viz.reset();
    viz.init(array);
    isRunning = false;
    btnStart.disabled = false;
    btnGenerate.disabled = false;
    btnPause.disabled = true;
    btnPause.innerText = '暂停';
};

selectSpeed.onchange = (e) => {
    setSpeed(e.target.value);
};
