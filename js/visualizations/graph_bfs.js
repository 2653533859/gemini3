import { VizEngine } from '../viz_engine.js';

class GraphBFSViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Grid BFS';

        // Grid Configuration
        this.rows = 15;
        this.cols = 20; // 15x20 grid
        this.grid = [];
        this.startPos = { r: 5, c: 4 };
        this.targetPos = { r: 5, c: 15 };
        this.walls = new Set();
        this.isMousePressed = false;

        // Note: We override setup since we don't use the standard bar canvas
        this.setupGrid();
        this.initControls();
    }

    // Override standard init to do nothing since we custom init
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

                // Set special classes
                if (r === this.startPos.r && c === this.startPos.c) node.classList.add('start');
                else if (r === this.targetPos.r && c === this.targetPos.c) node.classList.add('target');

                // Event Listeners for Wall drawing
                node.addEventListener('mousedown', () => {
                    this.isMousePressed = true;
                    this.toggleWall(r, c);
                });
                node.addEventListener('mouseenter', () => {
                    if (this.isMousePressed) this.toggleWall(r, c);
                });

                container.appendChild(node);
                rowArr.push(node);
            }
            this.grid.push(rowArr);
        }

        // Global mouse up
        document.addEventListener('mouseup', () => this.isMousePressed = false);
    }

    toggleWall(r, c) {
        if (this.isSorting) return;
        // Don't overwrite start or target
        if ((r === this.startPos.r && c === this.startPos.c) ||
            (r === this.targetPos.r && c === this.targetPos.c)) return;

        const key = `${r},${c}`;
        if (this.walls.has(key)) {
            this.walls.delete(key);
            this.grid[r][c].classList.remove('wall');
        } else {
            this.walls.add(key);
            this.grid[r][c].classList.add('wall');
        }
    }

    initControls() {
        document.getElementById('btn-start').onclick = () => this.start();
        document.getElementById('btn-clear-path').onclick = () => this.clearPath();
        document.getElementById('btn-clear-board').onclick = () => this.clearBoard();

        // Disable Speed Control (fixed speed for grid is usually better)
        // Maybe implement simple sleep control later
    }

    clearPath() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].classList.remove('visited', 'path');
            }
        }
        this.updateStatus('路径已清除');
    }

    clearBoard() {
        this.clearPath();
        this.walls.clear();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].classList.remove('wall');
            }
        }
        this.updateStatus('墙壁已清空');
    }

    async start() {
        if (this.isSorting) return;
        this.clearPath();
        this.isSorting = true;
        this.updateStatus('开始 BFS 搜索...');

        await this.runBFS();

        this.isSorting = false;
    }

    async runBFS() {
        const queue = [{ r: this.startPos.r, c: this.startPos.c }];
        const visited = new Set();
        visited.add(`${this.startPos.r},${this.startPos.c}`);

        // To reconstruct path: parentMap[child_key] = parent_node
        const parentMap = new Map();

        this.highlightCode('line-q');
        this.highlightCode('line-visited');

        let found = false;

        while (queue.length > 0) {
            this.highlightCode('line-loop');
            const curr = queue.shift();
            const { r, c } = curr;

            this.highlightCode('line-pop');

            // If Target Found
            if (r === this.targetPos.r && c === this.targetPos.c) {
                this.highlightCode('line-check');
                this.updateStatus('找到目标！开始回溯路径...');
                found = true;
                break;
            }

            // Mark as visited visual (skip start node to keep it green)
            if (!(r === this.startPos.r && c === this.startPos.c)) {
                this.grid[r][c].classList.add('visited');
            }

            // Neighbors: Up, Right, Down, Left
            const neighbors = [
                { r: r - 1, c: c },
                { r: r, c: c + 1 },
                { r: r + 1, c: c },
                { r: r, c: c - 1 }
            ];

            this.highlightCode('line-neighbors');
            for (const n of neighbors) {
                if (n.r >= 0 && n.r < this.rows && n.c >= 0 && n.c < this.cols) {
                    const key = `${n.r},${n.c}`;
                    if (!visited.has(key) && !this.walls.has(key)) {
                        visited.add(key);
                        parentMap.set(key, curr);
                        queue.push(n);
                        this.highlightCode('line-add');
                    }
                }
            }

            // Small delay for ripple effect
            await new Promise(resolve => setTimeout(resolve, 20));
            // We use fixed timeout instead of this.sleep() for fluid grid animation
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
            // Limit loop
            if (path.length > this.rows * this.cols) break;
        }

        // Reverse to draw from start to end
        path.reverse();

        for (const node of path) {
            if (!((node.r === this.startPos.r && node.c === this.startPos.c) ||
                (node.r === this.targetPos.r && node.c === this.targetPos.c))) {
                this.grid[node.r][node.c].classList.add('path');
                this.grid[node.r][node.c].classList.remove('visited'); // switch style
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }

        this.updateStatus(`最短路径长度: ${path.length - 1} 步`);
    }

    // Required by base class but unused in grid
    render() { }
}

const viz = new GraphBFSViz();
