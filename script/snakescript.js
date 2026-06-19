document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('snake-current');
    const highScoreDisplay = document.getElementById('snake-best');
    const statusBanner = document.getElementById('snake-status-banner');

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [];
    let food = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    let nextVelocity = { x: 0, y: 0 }; 
    let score = 0;
    let gameInterval = null;
    let isGameOver = false;
    let hasStarted = false;

    let snakeRecord = localStorage.getItem('local_snake_record') || 0;
    highScoreDisplay.textContent = `High Score: ${snakeRecord}`;

    function resetGame() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        food = getRandomFoodPosition();
        velocity = { x: 0, y: 0 };
        nextVelocity = { x: 0, y: 0 };
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        isGameOver = false;
        hasStarted = false;
        statusBanner.textContent = "Press a Direction to Start";
        statusBanner.style.color = "#a0a0a0";
        
        if (gameInterval) clearInterval(gameInterval);
        // FIX: Changed from 100ms to 150ms to slow down speed smoothly
        gameInterval = setInterval(updateFrame, 150); 
    }

    function getRandomFoodPosition() {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            let onSnake = snake.some(part => part.x === newFood.x && part.y === newFood.y);
            if (!onSnake) break;
        }
        return newFood;
    }

    function updateFrame() {
        if (!hasStarted) {
            renderGraphics();
            return;
        }

        velocity = nextVelocity;
        const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            triggerGameOver();
            return;
        }

        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                triggerGameOver();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            food = getRandomFoodPosition();
        } else {
            snake.pop();
        }

        renderGraphics();
    }

    function renderGraphics() {
        ctx.fillStyle = '#161616';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff66';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 10;
        ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

        snake.forEach((part, idx) => {
            if (idx === 0) {
                ctx.fillStyle = '#8ab4f8';
                ctx.shadowColor = '#8ab4f8';
                ctx.shadowBlur = 12;
            } else {
                ctx.fillStyle = 'rgba(138, 180, 248, 0.6)';
                ctx.shadowBlur = 0;
            }
            ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });
        
        ctx.shadowBlur = 0;
    }

    function triggerGameOver() {
        clearInterval(gameInterval);
        isGameOver = true;
        statusBanner.textContent = "GAME OVER. Tap 🔄 to Restart!";
        statusBanner.style.color = "#b91c1c";

        if (score > parseInt(snakeRecord)) {
            snakeRecord = score;
            localStorage.setItem('local_snake_record', snakeRecord);
            highScoreDisplay.textContent = `High Score: ${snakeRecord} 🔥`;
        }
    }

    // Direction handler shared by both keyboard and mobile touch pads
    function handleDirectionChange(dir) {
        if (isGameOver) return;

        let startedJustNow = false;

        if (dir === 'UP' && velocity.y !== 1) {
            nextVelocity = { x: 0, y: -1 };
            startedJustNow = true;
        } else if (dir === 'DOWN' && velocity.y !== -1) {
            nextVelocity = { x: 0, y: 1 };
            startedJustNow = true;
        } else if (dir === 'LEFT' && velocity.x !== 1) {
            nextVelocity = { x: -1, y: 0 };
            startedJustNow = true;
        } else if (dir === 'RIGHT' && velocity.x !== -1) {
            nextVelocity = { x: 1, y: 0 };
            startedJustNow = true;
        }

        if (startedJustNow && !hasStarted) {
            hasStarted = true;
            statusBanner.textContent = "Game Live! Steer to Survive.";
            statusBanner.style.color = "#8ab4f8";
        }
    }

    // Keyboard bindings
    window.addEventListener('keydown', (e) => {
        const key = e.key;
        if (isGameOver && (key === ' ' || key === 'Spacebar')) {
            resetGame();
            return;
        }

        if (key === 'ArrowUp' || key === 'w' || key === 'W') handleDirectionChange('UP');
        else if (key === 'ArrowDown' || key === 's' || key === 'S') handleDirectionChange('DOWN');
        else if (key === 'ArrowLeft' || key === 'a' || key === 'A') handleDirectionChange('LEFT');
        else if (key === 'ArrowRight' || key === 'd' || key === 'D') handleDirectionChange('RIGHT');

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
            e.preventDefault();
        }
    });

    // Mobile D-Pad Touch Interface Links
    document.getElementById('btn-up').addEventListener('click', () => handleDirectionChange('UP'));
    document.getElementById('btn-down').addEventListener('click', () => handleDirectionChange('DOWN'));
    document.getElementById('btn-left').addEventListener('click', () => handleDirectionChange('LEFT'));
    document.getElementById('btn-right').addEventListener('click', () => handleDirectionChange('RIGHT'));
    document.getElementById('btn-restart').addEventListener('click', resetGame);

    resetGame();
});