import { VizEngine } from '../viz_engine.js';
import { generateRandomArray } from '../utils.js';
import { createArrayControls } from '../animation_controller.js';

class MergeSortViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Merge Sort';
    }

    async start() {
        if (this.isSorting) return;
        this.isSorting = true;
        this.toggleButtons(true);
        this.updateStatus('开始归并排序...');

        // In-place merge sort wrapper to match visualization style
        await this.mergeSort(0, this.array.length - 1);

        if (!this.isStopped) {
            this.updateStatus('排序完成！');
            this.markAllSorted();
            this.toggleButtons(false);
            this.isSorting = false;
        }
    }

    async mergeSort(left, right) {
        if (left >= right) return;

        this.highlightCode('line-base');
        let mid = Math.floor((left + right) / 2);
        this.highlightCode('line-mid');

        this.highlightCode('line-rec-l');
        await this.mergeSort(left, mid);

        this.highlightCode('line-rec-r');
        await this.mergeSort(mid + 1, right);

        this.highlightCode('line-merge-call');
        await this.merge(left, mid, right);
    }

    async merge(start, mid, end) {
        this.highlightCode('line-merge');
        this.updateStatus(`合并区间 [${start}, ${mid}] 和 [${mid + 1}, ${end}]`);

        let start2 = mid + 1;

        // If the direct merge is already sorted
        if (this.array[mid] <= this.array[start2]) {
            return;
        }

        // Two pointers equivalent for visualization
        // While start <= mid and start2 <= end
        while (start <= mid && start2 <= end) {
            if (!this.isSorting) throw new Error('Stopped');

            this.highlightCode('line-merge-cmp');
            // Select current start and start2 elements
            this.highlight([start, start2], 'compare');
            await this.sleep();

            if (this.array[start] <= this.array[start2]) {
                start++;
            } else {
                let value = this.array[start2];
                let index = start2;

                // Shift all the elements between element 1 and element 2, right by 1.
                // visualization of shifting: highlight "writing" action
                while (index !== start) {
                    this.array[index] = this.array[index - 1];
                    index--;
                    // Optional: visualize huge shifts (might be too slow, skipping for smoothness)
                }
                this.array[start] = value;

                // Highlight the insertion (swap-like effect)
                this.highlight([start], 'swap');
                this.render(); // Update visual bars
                await this.sleep();

                // Update pointers
                start++;
                mid++;
                start2++;
            }
            // Clear compare highlights for next iteration
            this.unhighlight([start - 1, start2 - 1]);
            this.render();
        }
    }
}

const viz = new MergeSortViz();
createArrayControls(viz, {
    createArray: () => generateRandomArray(15, 10, 180),
});
