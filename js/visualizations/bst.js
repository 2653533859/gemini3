import { sleep } from '../utils.js';

class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
        this.domElement = null;
    }
}

class BSTViz {
    constructor() {
        this.container = document.getElementById('bst-view');
        this.svg = document.getElementById('bst-svg');
        this.statusText = document.getElementById('status-text');
        this.root = null;

        this.containerWidth = this.container.clientWidth;
        this.nodeRadius = 20; // 40px diameter
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = text;
    }

    getCode(type) {
        const templates = {
            'insert': `
                <div class="code-panel" id="code-panel">
                    <div class="code-line" id="line-class"><span class="code-keyword">class</span> <span class="code-func">TreeNode</span>:</div>
                    <div class="code-line" id="line-init">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, val):</div>
                    <div class="code-line" id="line-init-body">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.val = val; self.left = None; self.right = None</div>
                    <div class="code-line"> </div>
                    <div class="code-line" id="line-insert"><span class="code-keyword">def</span> <span class="code-func">insert</span>(root, val):</div>
                    <div class="code-line" id="line-insert-none">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">if not</span> root: <span class="code-keyword">return</span> TreeNode(val)</div>
                    <div class="code-line" id="line-insert-left">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">if</span> val < root.val:</div>
                    <div class="code-line" id="line-insert-l-rec">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;root.left = insert(root.left, val)</div>
                    <div class="code-line" id="line-insert-right">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">else</span>:</div>
                    <div class="code-line" id="line-insert-r-rec">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;root.right = insert(root.right, val)</div>
                    <div class="code-line" id="line-insert-ret">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">return</span> root</div>
                </div>`,
            'preorder': `
                <div class="code-panel" id="code-panel">
                    <div class="code-line" id="line-pre"><span class="code-keyword">def</span> <span class="code-func">pre_order</span>(root):</div>
                    <div class="code-line" id="line-pre-check">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">if not</span> root: <span class="code-keyword">return</span></div>
                    <div class="code-line" id="line-pre-print">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-func">print</span>(root.val) <span class="code-comment"># Visit Root</span></div>
                    <div class="code-line" id="line-pre-left">&nbsp;&nbsp;&nbsp;&nbsp;pre_order(root.left) <span class="code-comment"># Visit Left</span></div>
                    <div class="code-line" id="line-pre-right">&nbsp;&nbsp;&nbsp;&nbsp;pre_order(root.right) <span class="code-comment"># Visit Right</span></div>
                </div>`,
            'inorder': `
                <div class="code-panel" id="code-panel">
                    <div class="code-line" id="line-in"><span class="code-keyword">def</span> <span class="code-func">in_order</span>(root):</div>
                    <div class="code-line" id="line-in-check">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">if not</span> root: <span class="code-keyword">return</span></div>
                    <div class="code-line" id="line-in-left">&nbsp;&nbsp;&nbsp;&nbsp;in_order(root.left) <span class="code-comment"># Visit Left</span></div>
                    <div class="code-line" id="line-in-print">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-func">print</span>(root.val) <span class="code-comment"># Visit Root</span></div>
                    <div class="code-line" id="line-in-right">&nbsp;&nbsp;&nbsp;&nbsp;in_order(root.right) <span class="code-comment"># Visit Right</span></div>
                </div>`,
            'postorder': `
                <div class="code-panel" id="code-panel">
                    <div class="code-line" id="line-post"><span class="code-keyword">def</span> <span class="code-func">post_order</span>(root):</div>
                    <div class="code-line" id="line-post-check">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">if not</span> root: <span class="code-keyword">return</span></div>
                    <div class="code-line" id="line-post-left">&nbsp;&nbsp;&nbsp;&nbsp;post_order(root.left) <span class="code-comment"># Visit Left</span></div>
                    <div class="code-line" id="line-post-right">&nbsp;&nbsp;&nbsp;&nbsp;post_order(root.right) <span class="code-comment"># Visit Right</span></div>
                    <div class="code-line" id="line-post-print">&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-func">print</span>(root.val) <span class="code-comment"># Visit Root</span></div>
                </div>`
        };
        return templates[type];
    }

    updateCodePanel(type) {
        const oldPanel = document.getElementById('code-panel');
        if (oldPanel) {
            oldPanel.outerHTML = this.getCode(type);
        }
    }

    highlightLine(lineIds) {
        document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
        if (Array.isArray(lineIds)) {
            lineIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('active');
            });
        }
    }

    // Helper to calculate coordinates
    // We'll use a simple strategy: Root is at top center.
    // Children divide horizontal space.
    // Width of level = containerWidth / (2^depth)
    updateLayout(node, x, y, level) {
        if (!node) return;

        node.x = x;
        node.y = y;

        // Base horizontal spacing varies by level
        // Level 0: width
        // Level 1: width/2
        // Level 2: width/4
        // A standard gap approach is: offset = containerWidth / (2^(level+2)) * constant
        // Let's rely on fixed offsets per level that shrink

        const offset = 180 / (level + 1);

        this.updateLayout(node.left, x - offset, y + 60, level + 1);
        this.updateLayout(node.right, x + offset, y + 60, level + 1);
    }

    // Render the tree based on computed coordinates
    render() {
        // Clear DOM except SVG
        // Actually, clearing and re-rendering is easiest to ensure lines match
        this.svg.innerHTML = '';
        const existingNodes = document.querySelectorAll('.bst-node');
        existingNodes.forEach(n => n.remove());

        if (this.root) {
            // First calc positions
            this.updateLayout(this.root, this.containerWidth / 2, 40, 0);
            // Then draw
            this.drawNode(this.root);
        }
    }

    drawNode(node) {
        if (!node) return;

        // Create DOM
        const el = document.createElement('div');
        el.className = 'bst-node';
        el.innerText = node.val;
        // Adjust for center
        el.style.left = `${node.x - 20}px`;
        el.style.top = `${node.y - 20}px`;

        if (node.domElement && node.domElement.classList.contains('new')) {
            el.classList.add('new');
        }

        node.domElement = el; // update ref
        this.container.appendChild(el);

        // Draw Lines
        if (node.left) {
            this.drawLine(node.x, node.y, node.left.x, node.left.y);
            this.drawNode(node.left);
        }
        if (node.right) {
            this.drawLine(node.x, node.y, node.right.x, node.right.y);
            this.drawNode(node.right);
        }
    }

    drawLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'connection');
        this.svg.appendChild(line);
    }

    async insert(val) {
        this.updateCodePanel('insert');
        this.highlightLine(['line-insert']);

        if (!this.root) {
            this.highlightLine(['line-insert-none']);
            this.root = new TreeNode(val);
            // Mark new for animation
            this.root.domElement = { classList: { contains: () => true } };
            this.render();
            await sleep(500);
            this.updateStatus(`Inserted Root ${val}`);
            this.highlightLine([]);
            return;
        }

        this.updateStatus(`Inserting ${val}...`);
        await this._insertRec(this.root, val);
        this.render(); // Final stable render
        this.highlightLine([]);
    }

    async _insertRec(node, val) {
        if (!node) return new TreeNode(val);

        // Highlight current node
        this.highlightNode(node, 'highlight');
        await sleep(400);

        if (val < node.val) {
            this.highlightLine(['line-insert-left']);
            this.updateStatus(`${val} < ${node.val}, go Left`);
            await sleep(400);
            this.unhighlightNode(node, 'highlight');

            this.highlightLine(['line-insert-l-rec']);
            if (!node.left) {
                node.left = new TreeNode(val);
                // Render just to show the new node
                this.render(); // This might be abrupt, but okay for MVP
                this.updateStatus(`Inserted ${val} to left of ${node.val}`);
                await sleep(500);
            } else {
                await this._insertRec(node.left, val);
            }
        } else {
            this.highlightLine(['line-insert-right']);
            this.updateStatus(`${val} > ${node.val}, go Right`);
            await sleep(400);
            this.unhighlightNode(node, 'highlight');

            this.highlightLine(['line-insert-r-rec']);
            if (!node.right) {
                node.right = new TreeNode(val);
                this.render();
                this.updateStatus(`Inserted ${val} to right of ${node.val}`);
                await sleep(500);
            } else {
                await this._insertRec(node.right, val);
            }
        }
    }

    async search(val) {
        if (!this.root) {
            this.updateStatus('Tree is empty.');
            return;
        }
        this.updateStatus(`Searching for ${val}...`);
        const found = await this._searchRec(this.root, val);
        if (!found) {
            this.updateStatus(`${val} Not Found.`);
        }
    }

    async _searchRec(node, val) {
        if (!node) return false;

        this.highlightNode(node, 'highlight');
        await sleep(400);

        if (node.val == val) {
            this.unhighlightNode(node, 'highlight');
            this.highlightNode(node, 'found');
            this.updateStatus(`Found ${val}!`);
            await sleep(1000);
            this.unhighlightNode(node, 'found');
            return true;
        }

        this.unhighlightNode(node, 'highlight');

        if (val < node.val) {
            this.updateStatus(`${val} < ${node.val}, checking Left...`);
            return await this._searchRec(node.left, val);
        } else {
            this.updateStatus(`${val} > ${node.val}, checking Right...`);
            return await this._searchRec(node.right, val);
        }
    }

    highlightNode(node, className) {
        if (node.domElement) node.domElement.classList.add(className);
    }

    unhighlightNode(node, className) {
        if (node.domElement) node.domElement.classList.remove(className);
    }

    reset() {
        this.root = null;
        this.render();
        this.updateStatus('Tree cleared.');
    }


    // Traversals
    async preOrder(node) {
        if (!node) {
            this.highlightLine(['line-pre-check']);
            await sleep(400);
            return;
        }

        // Visit Root
        this.highlightLine(['line-pre-print']);
        this.highlightNode(node, 'highlight');
        this.updateStatus(`Visiting ${node.val}`);
        await sleep(800);
        this.unhighlightNode(node, 'highlight');

        // Left
        this.highlightLine(['line-pre-left']);
        await sleep(400);
        await this.preOrder(node.left);

        // Right
        this.highlightLine(['line-pre-right']);
        await sleep(400);
        await this.preOrder(node.right);
    }

    async inOrder(node) {
        if (!node) {
            this.highlightLine(['line-in-check']);
            await sleep(400);
            return;
        }

        // Left
        this.highlightLine(['line-in-left']);
        await sleep(400);
        await this.inOrder(node.left);

        // Visit Root
        this.highlightLine(['line-in-print']);
        this.highlightNode(node, 'highlight');
        this.updateStatus(`Visiting ${node.val}`);
        await sleep(800);
        this.unhighlightNode(node, 'highlight');

        // Right
        this.highlightLine(['line-in-right']);
        await sleep(400);
        await this.inOrder(node.right);
    }

    async postOrder(node) {
        if (!node) {
            this.highlightLine(['line-post-check']);
            await sleep(400);
            return;
        }

        // Left
        this.highlightLine(['line-post-left']);
        await sleep(400);
        await this.postOrder(node.left);

        // Right
        this.highlightLine(['line-post-right']);
        await sleep(400);
        await this.postOrder(node.right);

        // Visit Root
        this.highlightLine(['line-post-print']);
        this.highlightNode(node, 'highlight');
        this.updateStatus(`Visiting ${node.val}`);
        await sleep(800);
        this.unhighlightNode(node, 'highlight');
    }

    async runTraversal(type) {
        if (!this.root) {
            this.updateStatus("Empty Tree");
            return;
        }
        this.updateCodePanel(type);
        this.updateStatus(`Starting ${type} Traversal...`);

        if (type === 'preorder') await this.preOrder(this.root);
        else if (type === 'inorder') await this.inOrder(this.root);
        else if (type === 'postorder') await this.postOrder(this.root);

        this.updateStatus('Traversal Completed');
        this.highlightLine([]);
    }
}

// Logic
const viz = new BSTViz();
// Init with some nodes
const initialNodes = [50, 30, 70, 20, 40, 60, 80];
// We can't use await in top level easily in module without top-level await support (which is standard now but let's be safe).
// Just build the tree synchronously for init
function buildInitTree() {
    initialNodes.forEach(val => {
        // Simple insert logic without animation
        const insert = (n, v) => {
            if (!n) return new TreeNode(v);
            if (v < n.val) n.left = insert(n.left, v);
            else n.right = insert(n.right, v);
            return n;
        }
        viz.root = insert(viz.root, val);
    });
    viz.render();
}
buildInitTree();

const btnInsert = document.getElementById('btn-insert');
const btnSearch = document.getElementById('btn-search');
const btnReset = document.getElementById('btn-reset');
const inputVal = document.getElementById('input-val');
const btnPre = document.getElementById('btn-preorder');
const btnIn = document.getElementById('btn-inorder');
const btnPost = document.getElementById('btn-postorder');

btnInsert.onclick = async () => {
    const val = parseInt(inputVal.value);
    if (isNaN(val)) return;

    toggleButtons(true);
    await viz.insert(val);
    toggleButtons(false);
    inputVal.value = Math.floor(Math.random() * 100);
};

btnSearch.onclick = async () => {
    const val = parseInt(inputVal.value);
    if (isNaN(val)) return;
    toggleButtons(true);
    await viz.search(val);
    toggleButtons(false);
};

btnReset.onclick = () => {
    viz.reset();
};

function toggleButtons(disabled) {
    btnInsert.disabled = disabled;
    btnSearch.disabled = disabled;
    btnReset.disabled = disabled;
    if (btnPre) btnPre.disabled = disabled;
    if (btnIn) btnIn.disabled = disabled;
    if (btnPost) btnPost.disabled = disabled;
}

btnPre.onclick = async () => { toggleButtons(true); await viz.runTraversal('preorder'); toggleButtons(false); };
btnIn.onclick = async () => { toggleButtons(true); await viz.runTraversal('inorder'); toggleButtons(false); };
btnPost.onclick = async () => { toggleButtons(true); await viz.runTraversal('postorder'); toggleButtons(false); };
