document.addEventListener('DOMContentLoaded', () => {
    const size = 144;

    const cols = Math.floor(window.innerWidth / size);
    const rows = Math.floor(window.innerHeight / size);
    const mainRect = document.querySelector('main').getBoundingClientRect();

    const candidates = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * size;
            const y = r * size;
            const overlapsMain = x < mainRect.right  && x + size > mainRect.left &&
                                 y < mainRect.bottom && y + size > mainRect.top;
            if (!overlapsMain) candidates.push([c, r]);
        }
    }

    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const placed = [];
    for (const sq of candidates) {
        const [c, r] = sq;
        const tooClose = placed.some(([pc, pr]) => Math.abs(c - pc) <= 1 && Math.abs(r - pr) <= 1);
        if (!tooClose) placed.push(sq);
        if (placed.length === 16) break;
    }

    // Assign piece types to a set of positions for one color.
    // Rules: 1 king, 1 queen, max 2 rooks, max 2 knights,
    //        max 1 bishop on a light square, max 1 bishop on a dark square.
    // (c + r) % 2 === 0 is a light square in the board's conic gradient.
    function assignPieces(positions, color) {
        const lightIdx = [];
        const darkIdx  = [];
        positions.forEach(([c, r], i) => {
            ((c + r) % 2 === 0 ? lightIdx : darkIdx).push(i);
        });

        const pieceAt = new Array(positions.length).fill(null);

        // Place at most one bishop per square color
        if (lightIdx.length > 0) {
            pieceAt[lightIdx[Math.floor(Math.random() * lightIdx.length)]] = `${color}bishop`;
        }
        if (darkIdx.length > 0) {
            pieceAt[darkIdx[Math.floor(Math.random() * darkIdx.length)]] = `${color}bishop`;
        }

        // Fill remaining slots: king and queen always included first,
        // then a random subset of rooks and knights up to the available count.
        const remaining = pieceAt.reduce((acc, p, i) => (p === null ? [...acc, i] : acc), []);

        const optionals = ['rook', 'rook', 'knight', 'knight'];
        for (let i = optionals.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionals[i], optionals[j]] = [optionals[j], optionals[i]];
        }
        const others = ['king', 'queen', ...optionals].slice(0, remaining.length);

        // Shuffle the assignment order so pieces land on random squares
        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }

        remaining.forEach((posIdx, i) => { pieceAt[posIdx] = `${color}${others[i]}`; });

        return positions.map(([c, r], i) => ({ c, r, piece: pieceAt[i] })).filter(p => p.piece);
    }

    const half = Math.floor(placed.length / 2);
    const assignments = [
        ...assignPieces(placed.slice(0, half), 'white'),
        ...assignPieces(placed.slice(half),    'black'),
    ];

    assignments.forEach(({ c, r, piece }) => {
        const el = document.createElement('div');
        el.className = `chess-piece ${piece.startsWith('white') ? 'white' : 'black'}`;
        const img = document.createElement('img');
        img.src = `./res/${piece}.svg`;
        img.alt = piece;
        el.appendChild(img);
        el.style.left = (c * size) + 'px';
        el.style.top = (r * size) + 'px';
        document.body.appendChild(el);
    });
});
