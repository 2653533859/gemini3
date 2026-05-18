import { VizEngine } from '../viz_engine.js';
import { generateRandomArray } from '../utils.js';
import { createArrayControls } from '../animation_controller.js';

class BubbleSortViz extends VizEngine {
    constructor() {
        super('viz-canvas');
        this.statusText = document.getElementById('status-text');
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = text;
    }

    highlightLine(lineNums) {
        // Clear all highlights
        document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));

        // Add highlight
        if (Array.isArray(lineNums)) {
            lineNums.forEach(n => {
                const el = document.getElementById(`line-${n}`);
                if (el) el.classList.add('active');
            });
        }
    }

    async run() {
        this.updateStatus('开始排序...');
        this.highlightLine([1]);
        await this.wait();

        const n = this.array.length;
        this.highlightLine([2]);
        await this.wait();

        for (let i = 0; i < n; i++) {
            this.highlightLine([3]);
            this.updateStatus(`第 ${i + 1} 轮遍历`);
            await this.wait();

            let swapped = false;
            this.highlightLine([5]);
            await this.wait();

            for (let j = 0; j < n - i - 1; j++) {
                this.highlightLine([6]);
                await this.wait();

                // Highlight comparison
                this.highlightLine([7]);
                await this.highlight([j, j + 1], 'compare');

                if (this.array[j] > this.array[j + 1]) {
                    this.updateStatus(`交换 ${this.array[j]} 和 ${this.array[j + 1]}`);
                    this.highlightLine([8]);
                    await this.swap(j, j + 1);

                    swapped = true;
                    this.highlightLine([9]);
                    await this.wait();
                }
            }

            // Mark the last element of this pass as sorted
            this.markSorted(n - i - 1);

            this.highlightLine([10]);
            await this.wait();

            if (!swapped) {
                this.updateStatus('未发生交换，排序提前结束');
                this.highlightLine([11]);
                await this.wait();

                // Mark remaining as sorted
                for (let k = 0; k < n - i - 1; k++) this.markSorted(k);
                break;
            }
        }

        // Ensure all sorted visually
        this.markAllSorted();
        this.updateStatus('排序完成！');
        this.highlightLine([]);
    }
}

// Controller Logic
const viz = new BubbleSortViz();
createArrayControls(viz, {
    createArray: () => generateRandomArray(15, 10, 180),
});
