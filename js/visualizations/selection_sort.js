import { VizEngine } from '../viz_engine.js';
import { generateRandomArray, setSpeed } from '../utils.js';

class SelectionSortViz extends VizEngine {
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
        this.updateStatus('开始选择排序...');
        this.highlightLine([1]);
        await this.wait();

        const n = this.array.length;
        this.highlightLine([2]);
        await this.wait();

        for (let i = 0; i < n; i++) {
            this.highlightLine([3]);
            this.updateStatus(`第 ${i + 1} 轮查找最小值`);
            await this.wait();

            let min_idx = i;
            this.highlightLine([5]);
            // Highlight current assumed min (blue or distinct color?)
            // We can reuse 'compare' (yellow) but maybe we need a 'min' marker.
            // For now, let's just use 'compare' for the current min candidate.
            await this.highlight([min_idx], 'compare');

            for (let j = i + 1; j < n; j++) {
                this.highlightLine([6]);
                await this.wait();

                this.highlightLine([7]);
                // Highlight comparing j with min_idx
                await this.highlight([j, min_idx], 'compare');

                if (this.array[j] < this.array[min_idx]) {
                    this.updateStatus(`发现更小值: ${this.array[j]}`);
                    min_idx = j;
                    this.highlightLine([8]);
                    // Highlight new min
                    await this.highlight([min_idx], 'compare');
                }
            }

            // Swap
            this.highlightLine([11]);
            if (min_idx !== i) {
                this.updateStatus(`交换 ${this.array[i]} (当前位) 和 ${this.array[min_idx]} (最小值)`);
                await this.swap(i, min_idx);
            } else {
                this.updateStatus(`${this.array[i]} 已经是当前最小值，无需交换`);
            }

            this.markSorted(i);
            await this.wait();
        }

        this.markAllSorted();
        this.updateStatus('排序完成！');
        this.highlightLine([]);
    }
}

// Controller Logic
const viz = new SelectionSortViz();
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
