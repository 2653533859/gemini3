import { sleep } from '../utils.js';

class HashTableViz {
    constructor(size = 8) {
        this.size = size;
        this.buckets = Array.from({ length: size }, () => []);
        this.table = document.getElementById('hash-table');
        this.statusText = document.getElementById('status-text');
        this.render();
        this.bindControls();
    }

    hash(key) {
        return [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % this.size;
    }

    setStatus(message) {
        this.statusText.textContent = message;
    }

    highlightCode(...ids) {
        document.querySelectorAll('.code-line').forEach(line => line.classList.remove('active'));
        ids.forEach(id => document.getElementById(id)?.classList.add('active'));
    }

    getInput() {
        const key = document.getElementById('input-key').value.trim();
        const value = document.getElementById('input-value').value.trim();
        return { key, value };
    }

    render(active = {}) {
        this.table.innerHTML = '';

        this.buckets.forEach((bucket, index) => {
            const row = document.createElement('div');
            row.className = 'hash-row';

            const label = document.createElement('div');
            label.className = 'hash-index';
            label.textContent = index;

            const chain = document.createElement('div');
            chain.className = 'hash-chain';
            chain.setAttribute('aria-label', `bucket ${index}`);

            bucket.forEach(node => {
                const el = document.createElement('div');
                el.className = 'hash-node';
                if (active.index === index && active.key === node.key) {
                    el.classList.add(active.kind || 'active');
                }
                el.textContent = `${node.key}: ${node.value}`;
                chain.appendChild(el);
            });

            if (bucket.length === 0) {
                const empty = document.createElement('span');
                empty.className = 'info-label';
                empty.textContent = 'empty';
                chain.appendChild(empty);
            }

            row.append(label, chain);
            this.table.appendChild(row);
        });
    }

    async locate(key) {
        this.highlightCode('line-hash', 'line-index');
        const index = this.hash(key);
        this.setStatus(`hash("${key}") = ${index}`);
        this.render({ index });
        await sleep(500);
        return index;
    }

    async insert() {
        const { key, value } = this.getInput();
        if (!key) {
            this.setStatus('请输入 key');
            return;
        }

        const index = await this.locate(key);
        const bucket = this.buckets[index];

        this.highlightCode('line-insert', 'line-bucket', 'line-scan');
        for (const node of bucket) {
            this.render({ index, key: node.key });
            await sleep(350);

            if (node.key === key) {
                this.highlightCode('line-update');
                node.value = value || '(empty)';
                this.render({ index, key, kind: 'found' });
                this.setStatus(`更新 ${key}，bucket ${index} 中已有相同 key`);
                return;
            }
        }

        this.highlightCode('line-append');
        bucket.push({ key, value: value || '(empty)' });
        this.render({ index, key, kind: 'found' });
        this.setStatus(`插入 ${key} 到 bucket ${index}${bucket.length > 1 ? '，发生冲突并追加到链表末尾' : ''}`);
    }

    async search() {
        const { key } = this.getInput();
        if (!key) {
            this.setStatus('请输入 key');
            return;
        }

        const index = await this.locate(key);
        this.highlightCode('line-bucket', 'line-scan');

        for (const node of this.buckets[index]) {
            this.render({ index, key: node.key });
            await sleep(350);
            if (node.key === key) {
                this.render({ index, key, kind: 'found' });
                this.setStatus(`找到 ${key}: ${node.value}`);
                return;
            }
        }

        this.render({ index });
        this.setStatus(`bucket ${index} 中没有 ${key}`);
    }

    async delete() {
        const { key } = this.getInput();
        if (!key) {
            this.setStatus('请输入 key');
            return;
        }

        const index = await this.locate(key);
        const before = this.buckets[index].length;
        this.buckets[index] = this.buckets[index].filter(node => node.key !== key);
        this.render({ index });
        this.setStatus(before === this.buckets[index].length ? `没有找到 ${key}` : `已删除 ${key}`);
    }

    reset() {
        this.buckets = Array.from({ length: this.size }, () => []);
        [
            ['apple', '42'],
            ['banana', '17'],
            ['melon', '8'],
            ['lemon', '21'],
        ].forEach(([key, value]) => {
            this.buckets[this.hash(key)].push({ key, value });
        });
        this.highlightCode();
        this.render();
        this.setStatus('已载入示例数据');
    }

    bindControls() {
        document.getElementById('btn-insert').addEventListener('click', () => this.insert());
        document.getElementById('btn-search').addEventListener('click', () => this.search());
        document.getElementById('btn-delete').addEventListener('click', () => this.delete());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
        this.reset();
    }
}

new HashTableViz();
