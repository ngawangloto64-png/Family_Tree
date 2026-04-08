/**
 * Celebration module — confetti bursts, floating words, and winner popup.
 */

const CHEER_WORDS = [
    'Yeyyyy!', 'Woah!', 'Amazing!', 'Winner!', 'Congrats!',
    'Woooo!', 'Awesome!', 'Let\'s Go!', 'Boom!', 'Yaaas!',
    'Epic!', 'Hype!', 'Niceee!', 'GG!', 'Legendary!',
];

const CONFETTI_COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#e94560', '#7BC67E', '#FF69B4', '#00CED1',
];

function launchConfetti(x, y) {
    // Multiple bursts with delay for extended celebration
    _confettiBurst(x, y, 60);
    setTimeout(() => _confettiBurst(x, y, 40), 300);
    setTimeout(() => _confettiBurst(x, y, 30), 600);
}

function _confettiBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        piece.style.left = (x + (Math.random() - 0.5) * 160) + 'px';
        piece.style.top = (y + (Math.random() - 0.5) * 80) + 'px';

        const size = 6 + Math.random() * 12;
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';

        const shapes = ['50%', '2px', '0'];
        piece.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];

        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 250;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 100; // bias upward
        piece.style.setProperty('--dx', dx + 'px');
        piece.style.setProperty('--dy', dy + 'px');
        piece.style.animationDuration = (1.2 + Math.random() * 1.8) + 's';

        document.body.appendChild(piece);
        piece.addEventListener('animationend', () => piece.remove());
    }
}

function launchCheerWords(centerX, centerY) {
    const count = 5;
    const used = new Set();

    for (let i = 0; i < count; i++) {
        let word;
        do {
            word = CHEER_WORDS[Math.floor(Math.random() * CHEER_WORDS.length)];
        } while (used.has(word) && used.size < CHEER_WORDS.length);
        used.add(word);

        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'cheer-word';
            el.textContent = word;
            el.style.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

            // Spread around the center
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
            const dist = 80 + Math.random() * 120;
            el.style.left = (centerX + Math.cos(angle) * dist) + 'px';
            el.style.top = (centerY + Math.sin(angle) * dist) + 'px';
            el.style.setProperty('--float-x', (Math.cos(angle) * 60) + 'px');
            el.style.setProperty('--float-y', (-80 - Math.random() * 80) + 'px');
            el.style.animationDelay = (i * 0.1) + 's';

            document.body.appendChild(el);
            el.addEventListener('animationend', () => el.remove());
        }, i * 150);
    }
}

function showWinnerPopup(name, color) {
    // Remove any existing popup
    const existing = document.querySelector('.winner-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'winner-overlay';

    const cheerWord = CHEER_WORDS[Math.floor(Math.random() * CHEER_WORDS.length)];

    overlay.innerHTML = `
        <div class="winner-popup">
            <div class="winner-cheer">${cheerWord}</div>
            <div class="winner-label">The winner is</div>
            <div class="winner-name" style="color: ${color}">${name}</div>
            <div class="winner-stars">&#10024; &#127881; &#10024;</div>
            <button class="winner-close">Awesome!</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Trigger entrance animation
    requestAnimationFrame(() => overlay.classList.add('show'));

    // Close on button click or overlay click
    overlay.querySelector('.winner-close').addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 400);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 400);
        }
    });

    // Auto close after 15 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 400);
        }
    }, 15000);
}
