import { generateRandomArray, setSpeed } from './utils.js';

export function createArrayControls(viz, options = {}) {
    const {
        createArray = () => generateRandomArray(15, 10, 180),
        run = () => (typeof viz.run === 'function' ? viz.run() : viz.start()),
    } = options;

    const btnStart = document.getElementById('btn-start');
    const btnGenerate = document.getElementById('btn-generate');
    const btnPause = document.getElementById('btn-pause');
    const btnReset = document.getElementById('btn-reset');
    const selectSpeed = document.getElementById('select-speed');

    let array = createArray();
    let isRunning = false;

    viz.init(array);

    function setRunning(nextValue) {
        isRunning = nextValue;
        if (btnStart) btnStart.disabled = nextValue;
        if (btnGenerate) btnGenerate.disabled = nextValue;
        if (btnPause) btnPause.disabled = !nextValue;
    }

    function resetPauseButton() {
        if (!btnPause) return;
        btnPause.textContent = '暂停';
        btnPause.setAttribute('aria-pressed', 'false');
    }

    btnGenerate?.addEventListener('click', () => {
        if (isRunning) return;
        array = createArray();
        viz.reset();
        viz.init(array);
        resetPauseButton();
    });

    btnStart?.addEventListener('click', async () => {
        if (isRunning) return;

        if (viz.isPaused) {
            viz.resume();
            resetPauseButton();
            if (btnPause) btnPause.disabled = false;
            return;
        }

        setRunning(true);
        viz.isStopped = false;

        try {
            await run();
        } catch (error) {
            if (error.message !== 'Stopped') {
                throw error;
            }
        } finally {
            viz.isSorting = false;
            setRunning(false);
            resetPauseButton();
        }
    });

    btnPause?.addEventListener('click', () => {
        if (viz.isPaused) {
            viz.resume();
            resetPauseButton();
        } else {
            viz.pause();
            btnPause.textContent = '继续';
            btnPause.setAttribute('aria-pressed', 'true');
        }
    });

    btnReset?.addEventListener('click', () => {
        viz.stop();
        viz.isSorting = false;
        viz.isPaused = false;
        viz.clearColors();
        viz.init(array);
        setRunning(false);
        resetPauseButton();
    });

    selectSpeed?.addEventListener('change', event => {
        setSpeed(event.target.value);
    });
}
