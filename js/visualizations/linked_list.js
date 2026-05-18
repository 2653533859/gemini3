import { sleep } from '../utils.js';

class LinkedListViz {
    constructor() {
        this.container = document.getElementById('ll-view');
        this.statusText = document.getElementById('status-text');
        this.nodes = []; // Logic model: { value: 123, dom: element }
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = text;
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

    // Helper to create DOM structure for a node -> arrow
    createNodeDOM(value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'll-node-wrapper';

        const node = document.createElement('div');
        node.className = 'll-node new-node';
        node.innerText = value;

        const arrow = document.createElement('div');
        arrow.className = 'll-arrow';

        wrapper.appendChild(node);
        wrapper.appendChild(arrow); // Initially added, removed if last

        return { wrapper, node, arrow };
    }

    // Refresh the entire view based on this.nodes list (Simpler for inserts/deletes than mutating DOM intricately)
    // Actually, for animation purposes, we should try to manipulate DOM if possible.
    // But for a simple MVP, re-rendering with 'new-node' class ONLY on the new guy is tricky.
    // Hybrid approach: 
    // We maintain this.nodes as objects storing the Value and the Key (or ID).
    // Let's stick to appending/inserting in DOM for smooth animation.

    async append(value) {
        this.highlightLine(['line-append']);
        await sleep(200);

        this.highlightLine(['line-append-node']);
        this.updateStatus(`Creating Node(${value})...`);

        const { wrapper, node, arrow } = this.createNodeDOM(value);
        // By default, a new node appended at end points to NULL.
        // We can visual null as a text label.
        const nullLabel = document.createElement('div');
        nullLabel.className = 'll-null';
        nullLabel.innerText = 'NULL';
        wrapper.appendChild(nullLabel);

        // If it's the first node
        if (this.nodes.length === 0) {
            this.highlightLine(['line-append-empty']);
            this.container.appendChild(wrapper);

            // Add HEAD label
            const ptr = document.createElement('div');
            ptr.className = 'node-pointer';
            ptr.innerText = 'HEAD';
            node.appendChild(ptr);

            this.nodes.push({ value, wrapper, node });
            await sleep(500);
            this.updateStatus(`Node(${value}) set as HEAD.`);
            this.highlightLine([]);
            return;
        }

        // Traverse
        this.highlightLine(['line-append-trav']);
        this.updateStatus('Traversing from HEAD...');

        let curr = this.nodes[0];
        // Visual traversal
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].node.classList.add('highlight');
            this.highlightLine(['line-append-loop']);
            await sleep(300);
            this.nodes[i].node.classList.remove('highlight');
        }

        this.highlightLine(['line-append-link']);
        // The last node currently has a NULL text. We need to remove "NULL" and show arrow -> New Node.
        const lastNodeWrapper = this.nodes[this.nodes.length - 1].wrapper;
        // Remove old 'NULL'
        const oldNull = lastNodeWrapper.querySelector('.ll-null');
        if (oldNull) oldNull.remove();

        // Append the new structure
        this.container.appendChild(wrapper);
        this.nodes.push({ value, wrapper, node });

        this.updateStatus(`Linked new Node(${value}) at end.`);
        this.highlightLine([]);
    }

    async prepend(value) {
        this.updateStatus(`Prepending Node(${value})...`);

        const { wrapper, node, arrow } = this.createNodeDOM(value);

        if (this.nodes.length === 0) {
            // Same as append empty
            this.append(value);
            return;
        }

        // Update old HEAD to remove "HEAD" label? 
        // My implementation puts HEAD label inside the node DOM.
        const oldHead = this.nodes[0].node;
        const oldHeadPtr = oldHead.querySelector('.node-pointer');
        if (oldHeadPtr) oldHeadPtr.remove();

        // New node points to old head
        // Remove NULL from new node since it's not last
        // wrapper comes with [Node, Arrow, NULL] (if we used previous logic)
        // createNodeDOM returns [Node, Arrow].

        // Insert before first child
        this.container.insertBefore(wrapper, this.container.firstChild);

        // Add HEAD label to new node
        const ptr = document.createElement('div');
        ptr.className = 'node-pointer';
        ptr.innerText = 'HEAD';
        node.appendChild(ptr);

        this.nodes.unshift({ value, wrapper, node });

        await sleep(500);
        this.updateStatus(`Node(${value}) is now HEAD.`);
    }

    // Simplified remove by value
    async remove(value) {
        if (this.nodes.length === 0) {
            this.updateStatus('List is empty.');
            return;
        }

        this.updateStatus(`Searching for ${value}...`);

        // Handle Head
        if (this.nodes[0].value == value) {
            this.updateStatus(`Found ${value} at HEAD. Removing...`);
            const target = this.nodes[0];
            target.node.classList.add('deleting');
            target.wrapper.style.opacity = '0';
            await sleep(500);

            target.wrapper.remove();
            this.nodes.shift();

            // Update new head if exists
            if (this.nodes.length > 0) {
                const ptr = document.createElement('div');
                ptr.className = 'node-pointer';
                ptr.innerText = 'HEAD';
                this.nodes[0].node.appendChild(ptr);
            }
            return;
        }

        // Traverse
        let prev = this.nodes[0];
        for (let i = 1; i < this.nodes.length; i++) {
            const curr = this.nodes[i];

            curr.node.classList.add('highlight'); // Search color
            await sleep(200);

            if (curr.value == value) {
                curr.node.classList.remove('highlight');
                curr.node.classList.add('found');
                this.updateStatus(`Found ${value} at index ${i}. Removing...`);
                await sleep(500);

                // Visual removal
                curr.node.classList.add('deleting');
                curr.wrapper.style.opacity = '0';
                await sleep(500);

                curr.wrapper.remove();

                // If this was the last node, the previous node needs a NULL
                if (i === this.nodes.length - 1) {
                    const nullLabel = document.createElement('div');
                    nullLabel.className = 'll-null';
                    nullLabel.innerText = 'NULL';
                    prev.wrapper.appendChild(nullLabel);
                }

                this.nodes.splice(i, 1);
                return;
            }

            curr.node.classList.remove('highlight');
            prev = curr;
        }

        this.updateStatus(`${value} not found.`);
    }

    clear() {
        this.container.innerHTML = '';
        this.nodes = [];
        this.updateStatus('List cleared.');
    }
}

// Logic
const viz = new LinkedListViz();

const btnAppend = document.getElementById('btn-append');
const btnPrepend = document.getElementById('btn-prepend');
const btnRemove = document.getElementById('btn-remove');
const inputVal = document.getElementById('input-val');

btnAppend.onclick = async () => {
    const val = inputVal.value;
    if (val === '') return;
    toggleButtons(true);
    await viz.append(val);
    toggleButtons(false);
    inputVal.value = Math.floor(Math.random() * 100);
};

btnPrepend.onclick = async () => {
    const val = inputVal.value;
    if (val === '') return;
    toggleButtons(true);
    await viz.prepend(val);
    toggleButtons(false);
    inputVal.value = Math.floor(Math.random() * 100);
};

btnRemove.onclick = async () => {
    const val = inputVal.value;
    if (val === '') return;
    toggleButtons(true);
    await viz.remove(val);
    toggleButtons(false);
};

function toggleButtons(disabled) {
    btnAppend.disabled = disabled;
    btnPrepend.disabled = disabled;
    btnRemove.disabled = disabled;
}
