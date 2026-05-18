import { VizEngine } from '../viz_engine.js';

class GraphDFSViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Grid DFS';

        // Grid Configuration
        this.rows = 15;
        this.cols = 20;
        this.grid = [];
        this.startPos = { r: 5, c: 4 };
        this.targetPos = { r: 5, c: 15 };
        this.walls = new Set();
        this.isMousePressed = false;

        this.setupGrid();
        this.initControls();
    }

    // Override standard init
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
        document.addEventListener('mouseup', () => this.isMousePressed = false);
    }

    toggleWall(r, c) {
        if (this.isSorting) return;
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
    }

    clearPath() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].classList.remove('visited', 'path', 'head');
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
        this.updateStatus('开始 DFS 搜索...');

        await this.runDFS();

        this.isSorting = false;
    }

    async runDFS() {
        // Using Iterative DFS with Stack to avoid stack overflow and easier to enable/pause
        const stack = [{ r: this.startPos.r, c: this.startPos.c }];
        const visited = new Set();

        // Parent Map for path reconstruction
        const parentMap = new Map();

        this.highlightCode('line-def');

        let found = false;

        while (stack.length > 0) {
            this.highlightCode('line-loop');
            // Pop from stack (LIFO)
            const curr = stack.pop();
            const { r, c } = curr;
            const key = `${r},${c}`;

            // Visual Head
            if (this.grid[r][c] && !this.grid[r][c].classList.contains('start')) {
                this.grid[r][c].classList.add('head'); // Highlight current head
            }

            // Check Base Case
            if (r === this.targetPos.r && c === this.targetPos.c) {
                this.highlightCode('line-base');
                this.updateStatus('找到目标！');
                found = true;
                break;
            }

            if (!visited.has(key)) {
                visited.add(key);
                this.highlightCode('line-mark');

                // Visual Visited
                if (!(r === this.startPos.r && c === this.startPos.c)) {
                    this.grid[r][c].classList.add('visited');
                    // Remove head highlight
                    this.grid[r][c].classList.remove('head');
                }

                // Get Neighbors
                // Order matters for DFS shape: Up, Right, Down, Left -> 
                // Stack pushes in order, so last pushed is first popped.
                // If we want "Up" priority, we should push Up LAST.
                // Let's try: Right, Down, Left, Up (so Up is popped first)
                const neighbors = [
                    { r: r, c: c + 1 }, // Right
                    { r: r + 1, c: c }, // Down
                    { r: r, c: c - 1 }, // Left
                    { r: r - 1, c: c }  // Up
                ];

                this.highlightCode('line-rec');
                for (const n of neighbors) {
                    if (n.r >= 0 && n.r < this.rows && n.c >= 0 && n.c < this.cols) {
                        const nKey = `${n.r},${n.c}`;
                        // Important: in DFS we often check visited on POP, 
                        // but to reconstruct path cleanly we need to track parents carefuly.
                        // Standard DFS:
                        if (!visited.has(nKey) && !this.walls.has(nKey)) {
                            // We might push the same node multiple times in stack if reached from diff paths
                            // but we only process it once due to visited check on pop.
                            // To record "Path", parentMap needs to be set when we confirm we will visit it? 
                            // Actually, for visualization, setting parentMap on push is commonly accepted approx for "First found path"
                            // although technically the "true" parent is the one that actually popped it.
                            // Let's set parentMap here.
                            // Update parent map on push to ensure the path follows the latest edge added to stack
                            parentMap.set(nKey, curr);

                            stack.push(n);
                        }
                    }
                }
            }

            // Wait
            await new Promise(resolve => setTimeout(resolve, 30));
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
        let visitedKeys = new Set(); // Prevent infinite loop in bad parent map map state

        while (curr) {
            const key = `${curr.r},${curr.c}`;
            if (visitedKeys.has(key)) break;
            visitedKeys.add(key);

            path.push(curr);
            curr = parentMap.get(key);
        }

        path.reverse();

        for (const node of path) {
            if (!((node.r === this.startPos.r && node.c === this.startPos.c) ||
                (node.r === this.targetPos.r && node.c === this.targetPos.c))) {
                this.grid[node.r][node.c].classList.add('path');
                this.grid[node.r][node.c].classList.remove('visited');
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        }

        this.updateStatus(`DFS 路径长度: ${path.length - 1} (注意：不一定是最短)`);
    }

    render() { }
}

const viz = new GraphDFSViz();
