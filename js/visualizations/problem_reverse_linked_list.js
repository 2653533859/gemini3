import { VizEngine } from '../viz_engine.js';

class ReverseLinkedListViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Reverse Linked List';
        this.nodes = [];
        this.prevPtr = null;
        this.currPtr = null;
        this.nextPtr = null;

        this.initControls();
        this.generateList();
    }

    init() { }

    initControls() {
        document.getElementById('btn-generate').onclick = () => this.generateList();
        document.getElementById('btn-start').onclick = () => this.start();
    }

    generateList() {
        if (this.isSorting) return;

        const container = document.getElementById('list-container');
        container.innerHTML = '';
        this.nodes = [];

        // Initial NULL at start (which will be end after reverse)
        // Wait, for reverse logic, we start with prev=None. 
        // Visually, we usually show NULL at the end of the random list.

        const length = 5;
        for (let i = 0; i < length; i++) {
            const val = Math.floor(Math.random() * 90) + 10;
            const node = this.createNode(val, i);
            container.appendChild(node);
            this.nodes.push(node);

            // Arrow
            if (i < length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                arrow.id = `arrow-${i}`;
                container.appendChild(arrow);
            } else {
                // Final null ptr
                const arrow = document.createElement('div');
                arrow.className = 'arrow null-ptr'; // Dotted line
                const nullText = document.createElement('span');
                nullText.className = 'null-text';
                nullText.innerText = 'NULL';
                nullText.style.marginLeft = '10px';

                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.appendChild(arrow);
                wrapper.appendChild(nullText);
                container.appendChild(wrapper);
            }
        }

        // Initialize Pointers (Hidden initially)
        this.createPointers();
        this.updateStatus('准备就绪');
    }

    createNode(val, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'node-wrapper';
        wrapper.id = `node-wrapper-${index}`;

        const node = document.createElement('div');
        node.className = 'node';
        node.innerText = val;
        node.id = `node-${index}`;

        wrapper.appendChild(node);
        return wrapper;
    }

    createPointers() {
        // We will repurpose/move these pointers dynamically
        const container = document.getElementById('list-container');

        // Remove existing if any (except nodes/arrows)
        document.querySelectorAll('.pointer').forEach(el => el.remove());

        // Define pointers
        this.createOnePointer('Prev', 'ptr-prev', '⬆');
        this.createOnePointer('Curr', 'ptr-curr', '⬆');
        this.createOnePointer('Next', 'ptr-next', '⬇');
    }

    createOnePointer(label, cls, arrowChar) {
        const ptr = document.createElement('div');
        ptr.className = `pointer ${cls}`;
        ptr.innerHTML = `
            <span class="pointer-arrow">${arrowChar}</span>
            <span>${label}</span>
        `;
        ptr.style.opacity = '0'; // Hide initially
        document.getElementById('viz-canvas').appendChild(ptr);

        if (label === 'Prev') this.prevPtr = ptr;
        if (label === 'Curr') this.currPtr = ptr;
        if (label === 'Next') this.nextPtr = ptr;
    }

    async start() {
        if (this.isSorting) return;
        this.isSorting = true;
        this.updateStatus('开始反转链表...');

        try {
            await this.runReversal();
        } catch (error) {
            console.error(error);
            this.updateStatus('错误: ' + error.message);
        }

        this.isSorting = false;
    }

    async runReversal() {
        const nodes = this.nodes;
        // Pointers are absolutely positioned in viz-canvas, we need to move them to align with nodes

        // Step 1: Init
        this.highlightCode('line-init');
        this.updatePointers(null, null, null); // Reset

        // Show Prev at "Before Head" (Virtual NULL)
        // For visual simplicity, let's say Prev starts "off screen" left or just hidden
        this.updateStatus('初始化: prev = None');
        await this.wait(600);

        this.highlightCode('line-init-curr');
        this.updateStatus('初始化: curr = head');
        // Show Curr at Node 0
        this.movePointer(this.currPtr, nodes[0]);
        this.movePointer(this.prevPtr, null); // Hide prev
        await this.wait(600);

        let currIdx = 0;
        let prevIdx = -1; // -1 indicates null/before start

        this.highlightCode('line-loop');
        while (currIdx < nodes.length) {
            this.updateStatus(`循环: 处理节点 ${nodes[currIdx].firstChild.innerText}`);
            await this.wait(600);

            // next_temp = curr.next
            this.highlightCode('line-next');
            if (currIdx + 1 < nodes.length) {
                this.updateStatus('保存下次要去的节点: next_temp = curr.next');
                this.movePointer(this.nextPtr, nodes[currIdx + 1]);
            } else {
                this.updateStatus('next_temp = NULL (到达末尾)');
                // Build a visual null ptr at end to point to? Or just hide/point to void
                this.nextPtr.style.opacity = '0';
            }
            await this.wait(800);

            // curr.next = prev
            this.highlightCode('line-flip');
            this.updateStatus('反转箭头: curr.next 指向 prev');

            // Visual: Find arrow leaving curr and rotate it
            // Assuming iterative, arrow i connects node i to i+1.
            // But we are reversing.
            // If currIdx > 0, we flip arrow[currIdx-1]. Wait.
            // Arrow N connects Node N to Node N+1.
            // When at Node 0: arrow-0 points 0->1. We want 0 -> NULL.
            // When at Node 1: arrow-1 points 1->2. We want 1 -> 0.

            // Visualization Logic specifics:
            // We need to visually disconnect curr from next, and connect to prev.
            if (prevIdx === -1) {
                // Pointing to NULL (New Tail)
                // We physically replace the arrow with a NULL pointer styling
                if (currIdx < nodes.length - 1) {
                    const arrow = document.getElementById(`arrow-${currIdx}`);
                    if (arrow) {
                        arrow.style.opacity = '0'; // Hide original
                        // Create a fake null ptr to the left of node 0?
                        // Or just indicate it points to null.
                    }
                }

                // Add a "NULL" label to the left of head
                const nullBadge = document.createElement('div');
                nullBadge.className = 'arrow null-ptr';
                nullBadge.style.transform = 'rotate(180deg)';
                nullBadge.style.position = 'absolute';
                nullBadge.style.left = '-60px';

                nodes[currIdx].appendChild(nullBadge); // Append to wrapper

            } else {
                // Pointing to Prev Node
                // Use the arrow that WAS connecting prev->curr?
                // No, that arrow is gone or flipped.
                // We need to create/animate an arrow from curr -> prev.

                // Logic: Arrow 'prevIdx' connected prev->curr.
                // We want to flip it?
                const existingArrow = document.getElementById(`arrow-${prevIdx}`);
                if (existingArrow) {
                    existingArrow.style.transition = 'transform 0.5s ease-in-out';
                    existingArrow.style.transform = 'translateY(10px) rotate(180deg)'; // Slight offset to not overlap?
                    existingArrow.classList.add('reversed');
                    // Actually, if we just rotate 180, it might look like it's pointing from right to left properly.
                    // But DOM flow is Left->Right.
                    // Rotating an arrow between elements might look disconnected.
                    // Simply: It works well enough for simple viz.
                }
            }

            nodes[currIdx].firstChild.classList.add('processed');
            await this.wait(1000);

            // prev = curr
            this.highlightCode('line-move-prev');
            this.updateStatus('前移 prev 指针');
            this.movePointer(this.prevPtr, nodes[currIdx]);
            prevIdx = currIdx;
            await this.wait(600);

            // curr = next_temp
            this.highlightCode('line-move-curr');
            this.updateStatus('前移 curr 指针');
            currIdx++;
            if (currIdx < nodes.length) {
                this.movePointer(this.currPtr, nodes[currIdx]);
            } else {
                this.currPtr.style.opacity = '0';
                this.updateStatus('curr 变为 NULL，循环结束');
            }

            // Hide next ptr for now until next loop sets it
            this.nextPtr.style.opacity = '0';
            await this.wait(600);
        }

        this.highlightCode('line-return');
        this.updateStatus('返回 prev (新的头节点)');
        await this.wait(500);
        this.updateStatus('反转完成！🎉');
    }

    movePointer(ptr, targetNode) {
        if (!targetNode) {
            ptr.style.opacity = '0';
            return;
        }
        ptr.style.opacity = '1';

        // Get generic Bounding Rect relative to canvas
        const canvasRect = document.getElementById('viz-canvas').getBoundingClientRect();
        const nodeRect = targetNode.firstChild.getBoundingClientRect(); // targetNode is wrapper, firstChild is .node circle

        // Calculate center relative to canvas
        const left = nodeRect.left - canvasRect.left + (nodeRect.width / 2);
        const top = nodeRect.top - canvasRect.top + (nodeRect.height / 2); // Center of node

        // Offset based on pointer type
        let offsetTop = 40; // Default below
        if (ptr.classList.contains('ptr-next')) offsetTop = -80; // Above

        ptr.style.left = `${left}px`;
        ptr.style.top = `${top + offsetTop}px`;
    }

    updatePointers(p, c, n) {
        // Helper if needed
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const viz = new ReverseLinkedListViz();
