document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('memory-grid');
    const movesDisplay = document.getElementById('memory-moves');
    const bestDisplay = document.getElementById('memory-best');
    const statusBanner = document.getElementById('memory-status-banner');

    if (!grid) return;

    // 8 Cyberpunk data icons (pairs make a 4x4 grid of 16 cards)
    const cardIcons = ['💾', '📡', '🔋', '🤖', '👾', '🚀', '🔮', '🧬'];
    let deck = [...cardIcons, ...cardIcons];
    
    let flippedCards = [];
    let matchedCount = 0;
    let moves = 0;
    let isLockoutActive = false;

    // Load personal records from browser storage
    let memoryRecord = localStorage.getItem('local_memory_record') || null;
    bestDisplay.textContent = memoryRecord ? `Best: ${memoryRecord} moves` : `Best: --`;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function initializeGrid() {
        grid.innerHTML = '';
        shuffle(deck);
        moves = 0;
        matchedCount = 0;
        flippedCards = [];
        isLockoutActive = false;
        movesDisplay.textContent = `Moves: ${moves}`;
        statusBanner.textContent = "Matrix stabilized. Begin selection.";
        statusBanner.style.color = "#a0a0a0";

        deck.forEach((icon, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.icon = icon;
            card.dataset.index = index;

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">⚡</div>
                    <div class="card-back">${icon}</div>
                </div>
            `;

            card.addEventListener('click', () => handleCardFlip(card));
            grid.appendChild(card);
        });
    }

    function handleCardFlip(selectedCard) {
        // Stop clicks if animation lock is active, card is already flipped, or already matched
        if (isLockoutActive) return;
        if (selectedCard.classList.add('flipped')) return; // Check if already flipped
        if (flippedCards.includes(selectedCard) || selectedCard.classList.contains('matched')) return;

        selectedCard.classList.add('flipped');
        flippedCards.push(selectedCard);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = `Moves: ${moves}`;
            checkForMatch();
        }
    }

    function checkForMatch() {
        isLockoutActive = true;
        const [cardOne, cardTwo] = flippedCards;

        if (cardOne.dataset.icon === cardTwo.dataset.icon) {
            // Found a match
            cardOne.classList.add('matched');
            cardTwo.classList.add('matched');
            matchedCount += 2;
            flippedCards = [];
            isLockoutActive = false;

            if (matchedCount === deck.length) {
                triggerVictory();
            }
        } else {
            // Not a match - tilt back cards after a 1 second delay
            statusBanner.textContent = "Data mismatch. Relinking...";
            statusBanner.style.color = "#b91c1c";
            
            setTimeout(() => {
                cardOne.classList.remove('flipped');
                cardTwo.classList.remove('flipped');
                flippedCards = [];
                isLockoutActive = false;
                statusBanner.textContent = "Matrix stabilized. Select card.";
                statusBanner.style.color = "#a0a0a0";
            }, 1000);
        }
    }

    function triggerVictory() {
        statusBanner.textContent = "System decoded! Click here to clear matrix.";
        statusBanner.style.color = "#00ff66";
        statusBanner.style.cursor = "pointer";

        if (!memoryRecord || moves < parseInt(memoryRecord)) {
            memoryRecord = moves;
            localStorage.setItem('local_memory_record', memoryRecord);
            bestDisplay.textContent = `Best: ${memoryRecord} moves 🔥`;
        }

        statusBanner.onclick = () => {
            statusBanner.onclick = null;
            statusBanner.style.cursor = "default";
            initializeGrid();
        };
    }

    initializeGrid();
});