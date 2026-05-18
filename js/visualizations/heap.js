import { sleep } from '../utils.js';

class HeapViz {
    constructor() {
        this.heap = [];
        this.tree = document.getElementById('heap-tree');
        this.statusText = document.getElementById('status-text');
        this.bindControls();
        this.reset();
    }

    setStatus(message) {
        this.statusText.textContent = message;
    }

    highlightCode(...ids) {
        document.querySelectorAll('.code-line').forEach(line => line.classList.remove('active'));
        ids.forEach(id => document.getElementById(id)?.classList.add('active'));
    }

    render(active = []) {
        this.tree.innerHTML = '';

        if (this.heap.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'info-label';
            empty.textContent = 'heap is empty';
            this.tree.appendChild(empty);
            return;
        }

        let index = 0;
        let levelSize = 1;

        while (index < this.heap.length) {
            const level = document.createElement('div');
            level.className = 'heap-level';

            for (let i = 0; i < levelSize && index < this.heap.length; i++, index++) {
                const node = document.createElement('div');
                node.className = 'heap-node';
                if (active.includes(index)) node.classList.add('active');
                node.setAttribute('aria-label', `索引 ${index}，优先级 ${this.heap[index].priority}`);
                node.textContent = this.heap[index].priority;
                level.appendChild(node);
            }

            this.tree.appendChild(level);
            levelSize *= 2;
        }
    }

    async swap(i, j) {
        this.render([i, j]);
        await sleep(450);
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
        this.render([i, j]);
        await sleep(450);
    }

    async insert() {
        const priority = Number(document.getElementById('input-priority').value);
        const label = document.getElementById('input-label').value.trim() || 'item';

        if (!Number.isFinite(priority)) {
            this.setStatus('请输入有效优先级');
            return;
        }

        this.highlightCode('line-push');
        this.heap.push({ priority, label });
        let child = this.heap.length - 1;
        this.render([child]);
        this.setStatus(`插入 ${label}，优先级 ${priority}`);
        await sleep(450);

        this.highlightCode('line-up');
        while (child > 0) {
            const parent = Math.floor((child - 1) / 2);
            this.render([parent, child]);
            this.setStatus(`比较 parent ${this.heap[parent].priority} 与 child ${this.heap[child].priority}`);
            await sleep(450);

            if (this.heap[parent].priority <= this.heap[child].priority) break;
            await this.swap(parent, child);
            child = parent;
        }

        this.render([child]);
        this.setStatus('插入完成，堆性质已恢复');
    }

    async extract() {
        if (this.heap.length === 0) {
            this.setStatus('堆为空');
            return;
        }

        this.highlightCode('line-pop');
        const root = this.heap[0];
        this.render([0]);
        this.setStatus(`弹出堆顶：${root.label} (${root.priority})`);
        await sleep(500);

        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.highlightCode('line-replace');
            this.heap[0] = last;
            this.render([0]);
            await sleep(450);
            await this.sinkDown(0);
        }

        this.render();
        this.setStatus(`已弹出 ${root.label}，剩余 ${this.heap.length} 个元素`);
    }

    async sinkDown(parent) {
        this.highlightCode('line-down');

        while (true) {
            const left = parent * 2 + 1;
            const right = parent * 2 + 2;
            let smallest = parent;

            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }

            this.render([parent, smallest]);
            await sleep(450);

            if (smallest === parent) break;
            await this.swap(parent, smallest);
            parent = smallest;
        }
    }

    reset() {
        this.heap = [
            { priority: 2, label: 'deploy' },
            { priority: 5, label: 'report' },
            { priority: 8, label: 'email' },
            { priority: 12, label: 'backup' },
            { priority: 9, label: 'review' },
            { priority: 14, label: 'cleanup' },
        ];
        this.highlightCode();
        this.render();
        this.setStatus('已载入示例最小堆');
    }

    bindControls() {
        document.getElementById('btn-insert').addEventListener('click', () => this.insert());
        document.getElementById('btn-extract').addEventListener('click', () => this.extract());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
    }
}

new HeapViz();
