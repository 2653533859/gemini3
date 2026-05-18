import { VizEngine } from '../viz_engine.js';

class ValidParenthesesViz extends VizEngine {
    constructor() {
        super();
        this.name = 'Valid Parentheses';
        this.stack = [];
        this.inputStr = "";

        this.initControls();
    }

    init() { }

    initControls() {
        document.getElementById('btn-start').onclick = () => this.start();

        // Allow Enter key
        document.getElementById('input-str').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.start();
        });
    }

    setupViz(str) {
        const strContainer = document.getElementById('string-viz');
        strContainer.innerHTML = '';

        for (let i = 0; i < str.length; i++) {
            const box = document.createElement('div');
            box.className = 'char-box';
            box.innerText = str[i];

            const arrow = document.createElement('div');
            arrow.className = 'arrow-pointer';
            arrow.innerHTML = '⬆';
            box.appendChild(arrow);

            strContainer.appendChild(box);
        }

        document.getElementById('stack-viz').innerHTML = '';
        this.updateStatus('准备就绪');
    }

    async start() {
        if (this.isSorting) return;

        const input = document.getElementById('input-str').value.trim();
        if (!input) return;

        this.isSorting = true;
        this.inputStr = input;
        this.setupViz(input);

        try {
            await this.runValidation(input);
        } catch (error) {
            console.error(error);
            this.updateStatus('错误: ' + error.message);
        }

        this.isSorting = false;
    }

    async runValidation(s) {
        const pairs = { ")": "(", "]": "[", "}": "{" };
        const stackViz = document.getElementById('stack-viz');
        const strBoxes = document.querySelectorAll('.char-box');

        this.stack = []; // Theoretical stack

        this.highlightCode('line-init');
        this.highlightCode('line-map');

        for (let i = 0; i < s.length; i++) {
            const char = s[i];

            // Highlight current char
            strBoxes.forEach(b => b.classList.remove('current'));
            strBoxes[i].classList.add('current');

            this.highlightCode('line-loop');
            await this.wait(600);

            this.highlightCode('line-check-close');
            if (pairs[char]) {
                // It is a closing bracket
                this.updateStatus(`遇到右括号 '${char}'，检查栈顶...`);
                await this.wait(400);

                this.highlightCode('line-check-empty');

                // Get stack top element (visual)
                const stackItems = stackViz.children; // HTMLCollection (reversed logic in CSS? No, flex-direction column-reverse)
                // Actually DOM order is Append -> Last child is visually top if column-reverse used?
                // Let's check CSS: flex-direction: column-reverse; 
                // So appendChild adds to the "bottom" of DOM list, but visually it appears at top?
                // No. column-reverse: First child is at bottom. Last child is at top.
                // So appendChild adds a new Last Child -> Top. Correct.

                const topVal = this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;

                if (!topVal || topVal !== pairs[char]) {
                    strBoxes[i].classList.add('error');
                    this.updateStatus(`匹配失败！期望 '${topVal ? this.getOpposite(topVal) : '...'}' 但找到 '${char}'`);
                    this.highlightCode('line-return-false');
                    return false; // Invalid
                } else {
                    // Match found
                    this.updateStatus(`匹配成功！栈顶 '${topVal}' 与 '${char}' 抵消。`);
                    this.stack.pop();
                    this.highlightCode('line-pop');

                    // Visual Pop
                    if (stackViz.lastElementChild) {
                        stackViz.lastElementChild.classList.add('popping');
                        await this.wait(400);
                        stackViz.removeChild(stackViz.lastElementChild);
                    }

                    strBoxes[i].classList.add('success');
                }
            } else {
                // Open bracket
                this.updateStatus(`遇到左括号 '${char}'，压入栈中。`);
                this.highlightCode('line-push');

                this.stack.push(char);

                // Visual Push
                const item = document.createElement('div');
                item.className = 'stack-item';
                item.innerText = char;
                stackViz.appendChild(item);

                await this.wait(500);
            }
        }

        strBoxes.forEach(b => b.classList.remove('current'));

        this.highlightCode('line-return-final');
        if (this.stack.length === 0) {
            this.updateStatus('验证通过：字符串有效！✅');
        } else {
            this.updateStatus('验证失败：栈不为空（有未闭合的括号）。❌');
        }
    }

    getOpposite(char) {
        if (char === '(') return ')';
        if (char === '[') return ']';
        if (char === '{') return '}';
        return '?';
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const viz = new ValidParenthesesViz();
