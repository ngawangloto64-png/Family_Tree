/**
 * App module — main controller wiring UI, wheel, and API together.
 */

const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#C9CBCF', '#7BC67E', '#E77C8E', '#55BFC7',
    '#FF5733', '#DAF7A6', '#FFC300', '#C70039', '#900C3F',
    '#581845', '#1ABC9C', '#3498DB', '#8E44AD', '#F39C12',
];

let wheel;
let currentMode = 'custom';
let items = [];
let history = [];
let backendAvailable = false;

// ── Initialization ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    wheel = new SpinnerWheel('spinnerCanvas');

    // Check if backend is available
    checkBackend();

    // Start empty — user adds their own items
    items = [];
    wheel.setItems(items);
    renderItems();
    updateSpinButton();

    // Wire up mode tabs
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // Wire up spin button
    document.getElementById('spinBtn').addEventListener('click', handleSpin);

    // Wire up add item
    document.getElementById('addItemBtn').addEventListener('click', addItem);
    document.getElementById('newItemInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    // Wire up clear history
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        history = [];
        renderHistory();
    });

    // Wire up preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => loadDefaultItems(btn.dataset.preset));
    });
});

async function checkBackend() {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/defaults/', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
            backendAvailable = true;
            console.log('Backend connected');
        }
    } catch {
        backendAvailable = false;
        console.log('Backend not available — running in offline mode');
    }
}

// ── Mode Info ──────────────────────────────
const MODE_INFO = {
    name:     { title: 'Name Spinner',     desc: 'Pick a random person — great for choosing who goes first or assigning tasks' },
    number:   { title: 'Number Spinner',   desc: 'Generate a random number within your chosen range' },
    custom:   { title: 'Custom Spinner',   desc: 'Add your own items and spin to pick one randomly' },
    yesno:    { title: 'Yes / No Spinner', desc: 'Can\'t decide? Let the wheel make a quick yes or no call for you' },
    decision: { title: 'Decision Maker',   desc: 'Get a weighted opinion — from "Definitely Yes" to "Ask Again Later"' },
    color:    { title: 'Color Spinner',    desc: 'Spin to pick a random color — fun for art, games, or challenges' },
};

// ── Mode Switching ─────────────────────────
function switchMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.mode-tab[data-mode="${mode}"]`).classList.add('active');

    // Update mode header (reset to default for new mode)
    const info = MODE_INFO[mode] || MODE_INFO.custom;
    const titleEl = document.getElementById('modeTitle');
    const descEl = document.getElementById('modeDesc');
    titleEl.textContent = info.title;
    descEl.textContent = info.desc;
    titleEl.setAttribute('placeholder', info.title);
    descEl.setAttribute('placeholder', info.desc);

    document.getElementById('customControls').style.display = 'none';
    document.getElementById('numberControls').style.display = 'none';

    if (mode === 'number') {
        document.getElementById('numberControls').style.display = 'block';
        loadNumberWheel();
    } else if (mode === 'yesno') {
        items = [
            { label: 'Yes', color: '#4BC0C0' },
            { label: 'No', color: '#FF6384' },
        ];
        wheel.setItems(items);
        document.getElementById('customControls').style.display = 'none';
    } else {
        document.getElementById('customControls').style.display = 'block';
        if (mode === 'name' || mode === 'custom') {
            // Start empty — let user add their own items
            items = [];
            wheel.setItems(items);
        } else if (mode === 'color') loadDefaultItems('colors');
        else if (mode === 'decision') loadDefaultItems('decisions');
    }

    renderItems();
    updateSpinButton();
    clearResult();
}

// ── Default Item Loaders ───────────────────
function loadDefaultItems(presetKey) {
    const presets = {
        names: [
            { label: 'Alice', color: '#FF6384' },
            { label: 'Bob', color: '#36A2EB' },
            { label: 'Charlie', color: '#FFCE56' },
            { label: 'Diana', color: '#4BC0C0' },
            { label: 'Eve', color: '#9966FF' },
            { label: 'Frank', color: '#FF9F40' },
        ],
        numbers: Array.from({ length: 10 }, (_, i) => ({
            label: String(i + 1),
            color: COLORS[i],
        })),
        colors: [
            { label: 'Red', color: '#FF0000' },
            { label: 'Blue', color: '#0000FF' },
            { label: 'Green', color: '#00AA00' },
            { label: 'Yellow', color: '#FFD700' },
            { label: 'Purple', color: '#800080' },
            { label: 'Orange', color: '#FF8C00' },
            { label: 'Pink', color: '#FF69B4' },
            { label: 'Cyan', color: '#00CED1' },
        ],
        decisions: [
            { label: 'Definitely Yes', color: '#4BC0C0' },
            { label: 'Probably Yes', color: '#7BC67E' },
            { label: 'Maybe', color: '#FFCE56' },
            { label: 'Probably No', color: '#FF9F40' },
            { label: 'Definitely No', color: '#FF6384' },
            { label: 'Ask Again', color: '#9966FF' },
        ],
    };

    items = presets[presetKey] || [];
    wheel.setItems(items);
    renderItems();
    updateSpinButton();
}

function loadNumberWheel() {
    const min = parseInt(document.getElementById('minNum').value) || 1;
    const max = parseInt(document.getElementById('maxNum').value) || 10;

    if (min >= max) return;

    const count = Math.min(max - min + 1, 20); // Limit wheel segments
    const step = Math.max(1, Math.floor((max - min + 1) / count));

    items = [];
    for (let i = 0; i < count; i++) {
        const val = min + i * step;
        if (val > max) break;
        items.push({
            label: String(val),
            color: COLORS[i % COLORS.length],
        });
    }

    wheel.setItems(items);
    renderItems();
}

// ── Spinning ───────────────────────────────
async function handleSpin() {
    if (wheel.isSpinning || items.length < 2) return;

    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    clearResult();

    let result;
    let winnerIndex;

    if (currentMode === 'number' && backendAvailable) {
        try {
            const min = parseInt(document.getElementById('minNum').value) || 1;
            const max = parseInt(document.getElementById('maxNum').value) || 100;
            const data = await Api.numberSpin(min, max);
            result = String(data.result);
        } catch {
            result = items[Math.floor(Math.random() * items.length)].label;
        }
    } else if (currentMode === 'yesno' && backendAvailable) {
        try {
            const data = await Api.yesNoSpin();
            result = data.result;
        } catch {
            result = Math.random() > 0.5 ? 'Yes' : 'No';
        }
    } else if (backendAvailable) {
        try {
            const data = await Api.quickSpin(items.map(i => i.label));
            result = data.result;
        } catch {
            result = items[Math.floor(Math.random() * items.length)].label;
        }
    } else {
        // Offline fallback
        result = items[Math.floor(Math.random() * items.length)].label;
    }

    // Find winner index on the wheel
    winnerIndex = items.findIndex(i => i.label === result);
    if (winnerIndex === -1) winnerIndex = Math.floor(Math.random() * items.length);

    // Animate the wheel
    const winnerColor = items[winnerIndex]?.color || '#e94560';

    wheel.spin(winnerIndex, () => {
        showResult(result, winnerColor);
        spinBtn.disabled = false;

        const rect = wheel.canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Confetti bursts
        launchConfetti(cx, cy);

        // Floating cheer words around the wheel
        launchCheerWords(cx, cy);

        // Winner popup after a short delay
        setTimeout(() => showWinnerPopup(result, winnerColor), 500);

        // Add to history
        history.unshift({ result, time: new Date().toLocaleTimeString() });
        if (history.length > 20) history.pop();
        renderHistory();
    });
}

// ── Result Display ─────────────────────────
function showResult(text, color) {
    const el = document.getElementById('resultText');
    el.textContent = text;
    el.style.color = color;
    el.classList.add('show');
}

function clearResult() {
    const el = document.getElementById('resultText');
    el.classList.remove('show');
}

// ── Spin Button State ──────────────────────
function updateSpinButton() {
    const btn = document.getElementById('spinBtn');
    if (items.length < 2) {
        btn.disabled = true;
        btn.textContent = items.length === 0 ? 'ADD ITEMS TO SPIN' : 'ADD AT LEAST 2 ITEMS';
    } else {
        btn.disabled = false;
        btn.textContent = 'SPIN';
    }
}

// ── Items Rendering ────────────────────────
function renderItems() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';

    items.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="color" class="item-color-input" value="${item.color}" title="Change color">
            <span class="item-label" contenteditable="true" spellcheck="false">${item.label}</span>
            <button class="item-remove" data-index="${i}">&times;</button>
        `;

        const labelEl = row.querySelector('.item-label');
        labelEl.addEventListener('blur', () => {
            const newLabel = labelEl.textContent.trim();
            if (newLabel && newLabel !== item.label) {
                items[i].label = newLabel;
                wheel.setItems(items);
            } else if (!newLabel) {
                labelEl.textContent = item.label;
            }
        });
        labelEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                labelEl.blur();
            }
        });

        const colorInput = row.querySelector('.item-color-input');
        colorInput.addEventListener('input', () => {
            items[i].color = colorInput.value;
            wheel.setItems(items);
        });

        row.querySelector('.item-remove').addEventListener('click', () => removeItem(i));
        list.appendChild(row);
    });
}

function addItem() {
    const input = document.getElementById('newItemInput');
    const colorInput = document.getElementById('newItemColor');
    const label = input.value.trim();

    if (!label) return;

    items.push({ label, color: colorInput.value });
    wheel.setItems(items);
    renderItems();
    updateSpinButton();

    input.value = '';
    input.focus();
    // Cycle to next color
    colorInput.value = COLORS[items.length % COLORS.length];
}

function removeItem(index) {
    items.splice(index, 1);
    wheel.setItems(items);
    renderItems();
    updateSpinButton();
}

// ── History Rendering ──────────────────────
function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';

    if (history.length === 0) {
        list.innerHTML = '<div style="color:var(--text-secondary);font-size:0.85rem;text-align:center;padding:10px;">No spins yet</div>';
        return;
    }

    history.forEach(h => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span class="result">${h.result}</span><span class="time">${h.time}</span>`;
        list.appendChild(div);
    });
}
