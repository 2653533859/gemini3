import { VizEngine } from '../viz_engine.js';

class QuickSortViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Quick Sort';
        this.init();
    }

    async start() {
        if (this.isSorting) return;
        this.isSorting = true;
        this.toggleButtons(true);
        this.updateStatus('开始快速排序...');

        await this.quickSort(0, this.array.length - 1);

        if (!this.paused) { // Only if not manually stopped
            this.updateStatus('排序完成！');
            // Show all as sorted/completed
            for (let i = 0; i < this.array.length; i++) {
                this.highlight([i], 'sorted');
            }
            this.toggleButtons(false);
            this.isSorting = false;
        }
    }

    async quickSort(low, high) {
        if (low < high) {
            this.highlightCode('line-qs-base');
            // Partitioning
            let pi = await this.partition(low, high);

            // Recursive calls
            this.highlightCode('line-qs-rec-l');
            await this.quickSort(low, pi - 1);

            this.highlightCode('line-qs-rec-r');
            await this.quickSort(pi + 1, high);
        } else if (low === high) {
            // Single element is sorted in its place
            this.highlight([low], 'sorted');
        }
    }

    async partition(low, high) {
        this.highlightCode('line-partition');

        // Pivot selection
        let pivot = this.array[high];
        this.highlightCode('line-pivot');
        this.updateStatus(`选择基准值 (Pivot): ${pivot} (索引 ${high})`);

        // Highlight Pivot specially (e.g. Yellow/Purple via 'compare' or custom class)
        // Here we reuse match/compare colors. Let's use 'active' (red) for pivot for now or add custom style if possible.
        // VizEngine base minimal support: 
        // default: blue
        // compare: red
        // swap: purple
        // sorted: green

        // Let's use 'compare' (red) for pivot to make it stand out
        this.highlight([high], 'compare');
        await this.sleep();

        let i = low - 1;
        this.highlightCode('line-i');

        for (let j = low; j <= high - 1; j++) {
            if (!this.isSorting) throw new Error('Stopped');

            this.highlightCode('line-loop');
            // Highlight current element j (active) and pivot (compare)
            this.highlight([j], 'active');
            this.highlight([high], 'compare');

            this.updateStatus(`比较: ${this.array[j]} <= ${pivot} ?`);
            this.highlightCode('line-cmp');
            await this.sleep();

            if (this.array[j] <= pivot) {
                i++;
                // Swap arr[i] and arr[j]
                this.updateStatus(`交换: ${this.array[i]} 和 ${this.array[j]}`);
                this.highlightCode('line-swap-i');
                // Visualize swap
                this.highlight([i, j], 'swap');

                // Perform swap data
                [this.array[i], this.array[j]] = [this.array[j], this.array[i]];

                // Render swap (showing height change) with colors maintained
                this.render();
                this.highlight([i, j], 'swap');
                this.highlight([high], 'compare'); // Keep pivot highlighted
                await this.sleep();
            }

            // Clear highlights for j, but keep pivot
            this.unhighlight([j, i]);
            this.highlight([high], 'compare');
        }

        // Place pivot in correct position
        this.updateStatus(`将基准值 ${pivot} 放到正确位置: Index ${i + 1}`);
        this.highlightCode('line-swap-pivot');
        this.highlight([i + 1, high], 'swap');
        await this.sleep();

        [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
        this.render();

        // Mark pivot position as Sorted (it is now in final place)
        this.highlight([i + 1], 'sorted');
        await this.sleep();

        this.highlightCode('line-return-i');
        return i + 1;
    }
}

// Initialize
const viz = new QuickSortViz();
