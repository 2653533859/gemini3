import { VizEngine } from '../viz_engine.js';

class GraphDijkstraViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Dijkstra';

        // Grid Configuration
        this.rows = 15;
        this.cols = 20;
        this.grid = [];
        this.startPos = { r: 5, c: 4 };
        this.targetPos = { r: 5, c: 15 };

        this.walls = new Set();
        this.weights = new Set(); // "Mud" nodes with cost 5

        this.isMousePressed = false;
        this.drawMode = 'wall'; // 'wall' or 'weight'

        this.setupGrid();
        this.initControls();
    }

    init() { }

    setupGrid() {
        const container = document.getElementById('grid-canvas');
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            const rowArr = [];
            for (let c = 0; c < this.cols; c++) {
                const node = document.createElement('div');
                node.className = 'grid-node';
                node.dataset.r = r;
                node.dataset.c = c;

                if (r === this.startPos.r && c === this.startPos.c) node.classList.add('start');
                else if (r === this.targetPos.r && c === this.targetPos.c) node.classList.add('target');

                node.addEventListener('mousedown', () => {
                    this.isMousePressed = true;
                    this.handleDraw(r, c);
                });
                node.addEventListener('mouseenter', () => {
                    if (this.isMousePressed) this.handleDraw(r, c);
                });

                container.appendChild(node);
                rowArr.push(node);
            }
            this.grid.push(rowArr);
        }
        document.addEventListener('mouseup', () => this.isMousePressed = false);
    }

    handleDraw(r, c) {
        if (this.isSorting) return;
        if ((r === this.startPos.r && c === this.startPos.c) ||
            (r === this.targetPos.r && c === this.targetPos.c)) return;

        const key = `${r},${c}`;
        const node = this.grid[r][c];

        if (this.drawMode === 'wall') {
            // If already weight, remove weight first
            if (this.weights.has(key)) {
                this.weights.delete(key);
                node.classList.remove('weight');
            }

            if (this.walls.has(key)) {
                this.walls.delete(key);
                node.classList.remove('wall');
            } else {
                this.walls.add(key);
                node.classList.add('wall');
            }
        } else if (this.drawMode === 'weight') {
            // If already wall, remove wall first
            if (this.walls.has(key)) {
                this.walls.delete(key);
                node.classList.remove('wall');
            }

            if (this.weights.has(key)) {
                this.weights.delete(key);
                node.classList.remove('weight');
            } else {
                this.weights.add(key);
                node.classList.add('weight');
            }
        }
    }

    initControls() {
        // Mode Toggles
        const btnWall = document.getElementById('btn-mode-wall');
        const btnWeight = document.getElementById('btn-mode-weight');

        btnWall.onclick = () => {
            this.drawMode = 'wall';
            btnWall.classList.add('mode-active');
            btnWall.style.border = "1px solid var(--primary-color)";
            btnWeight.classList.remove('mode-active');
            btnWeight.style.border = "none";
        };

        btnWeight.onclick = () => {
            this.drawMode = 'weight';
            btnWeight.classList.add('mode-active');
            btnWeight.style.border = "1px solid var(--primary-color)";
            btnWall.classList.remove('mode-active');
            btnWall.style.border = "none";
        };

        document.getElementById('btn-start').onclick = () => this.start();
        document.getElementById('btn-clear-path').onclick = () => this.clearPath();
        document.getElementById('btn-clear-board').onclick = () => this.clearBoard();
    }

    clearPath() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].classList.remove('visited', 'path');
                // Keep weight/wall/start/target
            }
        }
        this.updateStatus('路径已清除');
    }

    clearBoard() {
        this.clearPath();
        this.walls.clear();
        this.weights.clear();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].classList.remove('wall', 'weight');
            }
        }
        this.updateStatus('地图已重置');
    }

    async start() {
        if (this.isSorting) return;
        this.clearPath();
        this.isSorting = true;
        this.updateStatus('开始 Dijkstra 搜索...');

        try {
            await this.runDijkstra();
        } catch (error) {
            console.error(error);
            alert("运行时错误: " + error.message);
            this.updateStatus('发生错误');
        }

        this.isSorting = false;
    }

    async runDijkstra() {
        // Simple PQ array: {r, c, dist}
        const pq = [{ r: this.startPos.r, c: this.startPos.c, dist: 0 }];
        const dists = new Map();
        const parentMap = new Map();

        const startKey = `${this.startPos.r},${this.startPos.c}`;
        dists.set(startKey, 0);

        this.highlightCode('line-init');
        this.highlightCode('line-pq');

        let found = false;

        while (pq.length > 0) {
            this.highlightCode('line-loop');
            // Mock Min-Heap Pop: Sort and pop
            pq.sort((a, b) => a.dist - b.dist);
            const curr = pq.shift(); // Remove first (smallest dist)
            const { r, c, dist } = curr;
            const currKey = `${r},${c}`;

            this.highlightCode('line-pop');

            // Lazy Deletion equivalent check
            if (dist > (dists.get(currKey) ?? Infinity)) {
                this.highlightCode('line-relax'); // reusing line-relax effectively
                continue;
            }

            // Visual Processing
            if (!(r === this.startPos.r && c === this.startPos.c) &&
                !(r === this.targetPos.r && c === this.targetPos.c)) {
                this.grid[r][c].classList.add('visited');
            }

            if (r === this.targetPos.r && c === this.targetPos.c) {
                this.highlightCode('line-check');
                this.updateStatus(`找到目标! 总代价: ${dist}`);
                found = true;
                break;
            }

            this.highlightCode('line-neighbors');
            const neighbors = [
                { r: r - 1, c: c }, { r: r, c: c + 1 },
                { r: r + 1, c: c }, { r: r, c: c - 1 }
            ];

            for (const n of neighbors) {
                if (n.r >= 0 && n.r < this.rows && n.c >= 0 && n.c < this.cols) {
                    const nKey = `${n.r},${n.c}`;
                    if (this.walls.has(nKey)) continue;

                    // COST Logic
                    // Base cost 1, Weight cost 5
                    let weight = 1;
                    if (this.weights.has(nKey)) weight = 5;

                    const newDist = dist + weight;
                    if (newDist < (dists.get(nKey) ?? Infinity)) {
                        this.highlightCode('line-update');
                        dists.set(nKey, newDist);
                        parentMap.set(nKey, curr);
                        pq.push({ r: n.r, c: n.c, dist: newDist });
                        this.highlightCode('line-push');
                    }
                }
            }

            // Wait - speed based on PQ size to keep things snappy but visible
            await new Promise(resolve => setTimeout(resolve, 20));
        }

        if (found) {
            await this.reconstructPath(parentMap);
        } else {
            this.updateStatus('无法到达目标！');
        }
    }

    async reconstructPath(parentMap) {
        let curr = this.targetPos;
        let path = [];

        while (curr) {
            const key = `${curr.r},${curr.c}`;
            path.push(curr);
            curr = parentMap.get(key);
        }

        path.reverse();

        for (const node of path) {
            if (!((node.r === this.startPos.r && node.c === this.startPos.c) ||
                (node.r === this.targetPos.r && node.c === this.targetPos.c))) {
                this.grid[node.r][node.c].classList.add('path');
                this.grid[node.r][node.c].classList.remove('visited');
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }
    }

    render() { }
}

const viz = new GraphDijkstraViz();
