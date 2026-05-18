import { VizEngine } from '../viz_engine.js';

class ClimbingStairsViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Climbing Stairs';
        this.n = 5;
        this.dp = [];

        this.initControls();
        this.generateStairs(this.n);
    }

    init() { }

    initControls() {
        document.getElementById('btn-start').onclick = () => {
            const input = document.getElementById('input-n');
            let val = parseInt(input.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 10) val = 10;
            input.value = val;
            this.n = val;
            this.start();
        };

        document.getElementById('input-n').onchange = (e) => {
            let val = parseInt(e.target.value);
            if (val > 0 && val <= 10) {
                this.n = val;
                this.generateStairs(this.n);
            }
        };
    }

    generateStairs(n) {
        if (this.isSorting) return;

        const container = document.getElementById('stairs-container');
        container.innerHTML = '';
        const dpTable = document.getElementById('dp-table');
        dpTable.innerHTML = '';

        // Generate Steps
        // We want step 1 to be lowest? Or highest?
        // Usually climbing UP. Step 1 is low.
        // We can visual steps increasing in height.

        const baseHeight = 40;
        const stepHeightIncrement = 20;

        for (let i = 1; i <= n; i++) {
            const step = document.createElement('div');
            step.className = 'step';
            step.id = `step-${i}`;
            step.style.height = `${baseHeight + (i * stepHeightIncrement)}px`;

            const num = document.createElement('span');
            num.className = 'step-num';
            num.innerText = `Step ${i}`;
            step.appendChild(num);

            const val = document.createElement('div');
            val.className = 'step-val';
            val.id = `step-val-${i}`;
            val.innerText = '?';
            step.appendChild(val);

            container.appendChild(step);

            // DP Table Cells
            const cell = document.createElement('div');
            cell.className = 'dp-cell';
            cell.id = `dp-cell-${i}`;
            cell.innerHTML = `<span>?</span><span class="idx">${i}</span>`;
            dpTable.appendChild(cell);
        }

        this.updateStatus('准备就绪');
        document.getElementById('formula-display').innerText = 'dp[i] = dp[i-1] + dp[i-2]';
    }

    async start() {
        if (this.isSorting) return;
        this.isSorting = true;
        this.generateStairs(this.n); // Reset
        this.updateStatus(`开始计算 n=${this.n} 的爬楼梯方法数...`);

        try {
            await this.runDP();
        } catch (error) {
            console.error(error);
            this.updateStatus('错误: ' + error.message);
        }

        this.isSorting = false;
    }

    async runDP() {
        const n = this.n;
        const dp = new Array(n + 1).fill(0);

        // Base case check
        if (n <= 2) {
            this.highlightCode('line-base1');
            this.updateStatus(`n=${n} <= 2, 直接返回 ${n}`);

            for (let i = 1; i <= n; i++) {
                this.setVal(i, i);
                this.highlightStep(i, 'highlight-curr');
            }
            await this.wait(1000);
            this.updateStatus('完成！');
            return;
        }

        // Init
        this.highlightCode('line-init');
        this.updateStatus('初始化 DP 数组');
        await this.wait(500);

        this.highlightCode('line-init-base');
        this.updateStatus('设置基准情况: dp[1]=1, dp[2]=2');
        dp[1] = 1;
        dp[2] = 2;
        this.setVal(1, 1);
        this.setVal(2, 2);
        this.highlightStep(1, 'highlight-base');
        this.highlightStep(2, 'highlight-base');
        await this.wait(1000);

        this.highlightCode('line-loop');
        for (let i = 3; i <= n; i++) {
            this.updateStatus(`计算第 ${i} 阶的方法数...`);
            this.highlightCode('line-loop');

            // Highlight operands
            const val1 = dp[i - 1];
            const val2 = dp[i - 2];

            this.highlightStep(i - 1, 'highlight-calc'); // Yellow read
            this.highlightStep(i - 2, 'highlight-calc');

            document.getElementById('formula-display').innerHTML = `dp[<span style="color:var(--primary-color)">${i}</span>] = dp[${i - 1}](${val1}) + dp[${i - 2}](${val2})`;
            await this.wait(1000);

            // Calc
            this.highlightCode('line-calc');
            dp[i] = val1 + val2;
            document.getElementById('formula-display').innerHTML += ` = <strong>${dp[i]}</strong>`;

            this.setVal(i, dp[i]);
            // Flash current
            const step = document.getElementById(`step-${i}`);
            step.classList.add('highlight-curr'); // Blue write

            this.updateStatus(`dp[${i}] = ${val1} + ${val2} = ${dp[i]}`);
            await this.wait(1200);

            // Clear highlights for next iter
            this.unhighlightStep(i - 1);
            this.unhighlightStep(i - 2);
            step.classList.remove('highlight-curr');
            step.classList.add('highlight-base'); // Mark as calculated/done
        }

        this.highlightCode('line-return');
        this.updateStatus(`计算完成！到达第 ${n} 阶共有 ${dp[n]} 种方法。`);
        this.highlightStep(n, 'highlight-curr'); // Keep final result highlighted
    }

    setVal(idx, val) {
        const stepVal = document.getElementById(`step-val-${idx}`);
        if (stepVal) {
            stepVal.innerText = val;
            stepVal.classList.add('show');
        }
        const cell = document.getElementById(`dp-cell-${idx}`);
        if (cell) {
            cell.querySelector('span:first-child').innerText = val;
            cell.classList.add('active');
        }
    }

    highlightStep(idx, cls) {
        const step = document.getElementById(`step-${idx}`);
        if (step) step.classList.add(cls);
        const cell = document.getElementById(`dp-cell-${idx}`);
        if (cell) {
            if (cls === 'highlight-calc') cell.classList.add('read');
            if (cls === 'highlight-curr') cell.classList.add('active');
        }
    }

    unhighlightStep(idx) {
        const step = document.getElementById(`step-${idx}`);
        if (step) {
            step.classList.remove('highlight-calc');
            // Don't remove 'highlight-base' if it has it
        }
        const cell = document.getElementById(`dp-cell-${idx}`);
        if (cell) cell.classList.remove('read');
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const viz = new ClimbingStairsViz();
