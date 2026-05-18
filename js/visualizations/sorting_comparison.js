import { generateRandomArray, sleep } from '../utils.js';

const algorithms = [
    { id: 'bubble', name: 'Bubble', factory: bubbleSteps },
    { id: 'selection', name: 'Selection', factory: selectionSteps },
    { id: 'insertion', name: 'Insertion', factory: insertionSteps },
    { id: 'quick', name: 'Quick', factory: quickSteps },
    { id: 'merge', name: 'Merge', factory: mergeSteps },
];

class SortComparison {
    constructor() {
        this.grid = document.getElementById('comparison-grid');
        this.statusText = document.getElementById('status-text');
        this.speedSelect = document.getElementById('select-speed');
        this.isRunning = false;
        this.baseArray = this.createArray();
        this.states = [];
        this.bindControls();
        this.reset();
    }

    createArray() {
        return generateRandomArray(12, 12, 96);
    }

    setStatus(message) {
        this.statusText.textContent = message;
    }

    bindControls() {
        document.getElementById('btn-generate').addEventListener('click', () => {
            if (this.isRunning) return;
            this.baseArray = this.createArray();
            this.reset();
            this.setStatus('已生成新数据');
        });

        document.getElementById('btn-start').addEventListener('click', () => this.start());
        document.getElementById('btn-reset').addEventListener('click', () => {
            if (this.isRunning) return;
            this.reset();
            this.setStatus('已重置');
        });
    }

    reset() {
        this.states = algorithms.map(algorithm => ({
            ...algorithm,
            iterator: algorithm.factory([...this.baseArray]),
            current: {
                array: [...this.baseArray],
                compare: [],
                swap: [],
                comparisons: 0,
                moves: 0,
                steps: 0,
                done: false,
            },
        }));
        this.render();
    }

    render() {
        this.grid.innerHTML = '';
        this.states.forEach(state => {
            const card = document.createElement('section');
            card.className = `comparison-card${state.current.done ? ' active' : ''}`;

            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = state.name;

            const bars = document.createElement('div');
            bars.className = 'comparison-bars';
            state.current.array.forEach((value, index) => {
                const bar = document.createElement('div');
                bar.className = 'comparison-bar';
                if (state.current.compare.includes(index)) bar.classList.add('compare');
                if (state.current.swap.includes(index)) bar.classList.add('swap');
                bar.style.height = `${value}%`;
                bars.appendChild(bar);
            });

            const metrics = document.createElement('div');
            metrics.className = 'comparison-metrics';
            metrics.append(
                this.metric('比较', state.current.comparisons),
                this.metric('移动', state.current.moves),
                this.metric('步数', state.current.steps),
            );

            card.append(title, bars, metrics);
            this.grid.appendChild(card);
        });
    }

    metric(label, value) {
        const el = document.createElement('div');
        el.className = 'comparison-metric';
        el.innerHTML = `<span>${label}</span>${value}`;
        return el;
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('btn-start').disabled = true;
        document.getElementById('btn-generate').disabled = true;
        document.getElementById('btn-reset').disabled = true;
        this.setStatus('正在并行对比排序过程...');

        let allDone = false;
        while (!allDone) {
            allDone = true;
            for (const state of this.states) {
                if (state.current.done) continue;

                const next = state.iterator.next();
                if (next.done) {
                    state.current = { ...state.current, done: true, compare: [], swap: [] };
                } else {
                    state.current = next.value;
                    allDone = false;
                }
            }
            this.render();
            await sleep(Number(this.speedSelect.value));
        }

        this.setStatus('对比完成');
        this.isRunning = false;
        document.getElementById('btn-start').disabled = false;
        document.getElementById('btn-generate').disabled = false;
        document.getElementById('btn-reset').disabled = false;
    }
}

function snapshot(array, metrics, extra = {}) {
    return {
        array: [...array],
        compare: extra.compare || [],
        swap: extra.swap || [],
        comparisons: metrics.comparisons,
        moves: metrics.moves,
        steps: ++metrics.steps,
        done: false,
    };
}

function* bubbleSteps(array) {
    const metrics = { comparisons: 0, moves: 0, steps: 0 };
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            metrics.comparisons++;
            yield snapshot(array, metrics, { compare: [j, j + 1] });
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                metrics.moves += 2;
                yield snapshot(array, metrics, { swap: [j, j + 1] });
            }
        }
    }
}

function* selectionSteps(array) {
    const metrics = { comparisons: 0, moves: 0, steps: 0 };
    for (let i = 0; i < array.length; i++) {
        let min = i;
        for (let j = i + 1; j < array.length; j++) {
            metrics.comparisons++;
            yield snapshot(array, metrics, { compare: [min, j] });
            if (array[j] < array[min]) min = j;
        }
        if (min !== i) {
            [array[i], array[min]] = [array[min], array[i]];
            metrics.moves += 2;
            yield snapshot(array, metrics, { swap: [i, min] });
        }
    }
}

function* insertionSteps(array) {
    const metrics = { comparisons: 0, moves: 0, steps: 0 };
    for (let i = 1; i < array.length; i++) {
        const key = array[i];
        let j = i - 1;
        while (j >= 0) {
            metrics.comparisons++;
            yield snapshot(array, metrics, { compare: [j, j + 1] });
            if (array[j] <= key) break;
            array[j + 1] = array[j];
            metrics.moves++;
            yield snapshot(array, metrics, { swap: [j, j + 1] });
            j--;
        }
        array[j + 1] = key;
        metrics.moves++;
        yield snapshot(array, metrics, { swap: [j + 1] });
    }
}

function* quickSteps(array) {
    const metrics = { comparisons: 0, moves: 0, steps: 0 };
    yield* quickSort(array, 0, array.length - 1, metrics);
}

function* quickSort(array, low, high, metrics) {
    if (low >= high) return;
    const pivotIndex = yield* partition(array, low, high, metrics);
    yield* quickSort(array, low, pivotIndex - 1, metrics);
    yield* quickSort(array, pivotIndex + 1, high, metrics);
}

function* partition(array, low, high, metrics) {
    const pivot = array[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        metrics.comparisons++;
        yield snapshot(array, metrics, { compare: [j, high] });
        if (array[j] <= pivot) {
            i++;
            if (i !== j) {
                [array[i], array[j]] = [array[j], array[i]];
                metrics.moves += 2;
                yield snapshot(array, metrics, { swap: [i, j] });
            }
        }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    metrics.moves += 2;
    yield snapshot(array, metrics, { swap: [i + 1, high] });
    return i + 1;
}

function* mergeSteps(array) {
    const metrics = { comparisons: 0, moves: 0, steps: 0 };
    yield* mergeSort(array, 0, array.length - 1, metrics);
}

function* mergeSort(array, left, right, metrics) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    yield* mergeSort(array, left, mid, metrics);
    yield* mergeSort(array, mid + 1, right, metrics);
    yield* merge(array, left, mid, right, metrics);
}

function* merge(array, left, mid, right, metrics) {
    const leftPart = array.slice(left, mid + 1);
    const rightPart = array.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftPart.length && j < rightPart.length) {
        metrics.comparisons++;
        yield snapshot(array, metrics, { compare: [left + i, mid + 1 + j] });
        array[k] = leftPart[i] <= rightPart[j] ? leftPart[i++] : rightPart[j++];
        metrics.moves++;
        yield snapshot(array, metrics, { swap: [k] });
        k++;
    }

    while (i < leftPart.length) {
        array[k] = leftPart[i++];
        metrics.moves++;
        yield snapshot(array, metrics, { swap: [k] });
        k++;
    }

    while (j < rightPart.length) {
        array[k] = rightPart[j++];
        metrics.moves++;
        yield snapshot(array, metrics, { swap: [k] });
        k++;
    }
}

new SortComparison();
