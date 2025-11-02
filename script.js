const SHAPES = [
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
    ],
    [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [1,1,1,1]
    ],
    [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    [
        [1,0,0],
        [1,1,0],
        [0,1,0]
    ],
    [
        [0,0,1],
        [0,1,1],
        [0,1,0]
    ],
    [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    [
        [0,0,0],
        [0,1,0],
        [1,1,1]
    ],
    [
        [1,1],
        [1,1], 
    ]
]
const COLORS = [
    '#fff',
    '#9b5fe0',
    '#16a4d8',
    '#60dbe8',
    '#8bd346',
    '#efdf48',
    '#f9a52c',
    '#d64e12',
    '#e0488b',
    '#a52a2a',
    '#808000',
    '#800000',
    '#000080'

]
const ROWS = 20;
const COLS = 10;

let grid = generateGrid();
let gameInterval = null;
let isPaused = false;
let isRunning = false;
let score = 0;

let highScore = localStorage.getItem("tetrisHighScore")
    ? parseInt(localStorage.getItem("tetrisHighScore"))
    : 0;
document.getElementById("highScore").innerText = "High Score: " + highScore;

// 🎵 Audio
let bgMusic = new Audio("bg-music.mp3");
let lineClearSound = new Audio("line-clear.mp3");
let gameOverSound = new Audio("game-over.mp3");
let dropSound = new Audio("piece-drop.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;
let isMuted = false;

document.getElementById("muteBtn").addEventListener("click", function() {
    isMuted = !isMuted;
    bgMusic.muted = lineClearSound.muted = gameOverSound.muted = dropSound.muted = isMuted;
    this.textContent = isMuted ? "🔊 Unmute" : "🔇 Mute";
});

let canvas = document.querySelector('#tetris');
let context = canvas.getContext('2d');
context.scale(30,30);

let nextCanvas = document.querySelector('#next');
let nextContext = nextCanvas.getContext('2d');
nextContext.scale(30,30);

let pieceObj = null;
let nextPiece = generateRandomPiece();
renderNextPiece();

function generateGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function generateRandomPiece() {
    let ran = Math.floor(Math.random() * SHAPES.length);
    return { piece: SHAPES[ran], colorIndex: ran + 1, x: 4, y: 0 };
}

function startGame() {
    if (isRunning) return;
    isRunning = true;
    isPaused = false;
    document.getElementById("startBtn").disabled = true;
    document.getElementById("pauseBtn").disabled = false;
    bgMusic.play();
    gameInterval = setInterval(newGameState, 500);
}

function pauseGame() {
    if (!isRunning) return;
    if (!isPaused) {
        clearInterval(gameInterval);
        bgMusic.pause();
        isPaused = true;
        document.getElementById("pauseBtn").textContent = "▶️ Resume";
    } else {
        gameInterval = setInterval(newGameState, 500);
        bgMusic.play();
        isPaused = false;
        document.getElementById("pauseBtn").textContent = "⏸️ Pause";
    }
}

function newGameState() {
    checkGrid();
    if (pieceObj == null) {
        pieceObj = nextPiece;
        nextPiece = generateRandomPiece();
        renderNextPiece();
    }
    moveDown();
}

function moveDown() {
    if (!collision(pieceObj.x, pieceObj.y + 1)) {
        pieceObj.y++;
    } else {
        for (let i = 0; i < pieceObj.piece.length; i++) {
            for (let j = 0; j < pieceObj.piece[i].length; j++) {
                if (pieceObj.piece[i][j]) {
                    grid[pieceObj.y + i][pieceObj.x + j] = pieceObj.colorIndex;
                }
            }
        }

        if (pieceObj.y === 0) {
            gameOverSound.play();
            bgMusic.pause();
            bgMusic.currentTime = 0;
            alert(`Game Over! Your Score: ${score}`);
            grid = generateGrid();
            score = 0;
            updateScore();
            renderGrid();
            clearInterval(gameInterval);
            isRunning = false;
            document.getElementById("startBtn").disabled = false;
            document.getElementById("pauseBtn").disabled = true;
            return;
        }

        checkGrid();
        pieceObj = null;
        dropSound.play();
    }
    renderGrid();
}

function renderPiece() {
    const { piece, colorIndex, x, y } = pieceObj;
    context.fillStyle = COLORS[colorIndex];
    for (let i = 0; i < piece.length; i++)
        for (let j = 0; j < piece[i].length; j++)
            if (piece[i][j])
                context.fillRect(x + j, y + i, 1, 1);
}

function renderGrid() {
    for (let i = 0; i < ROWS; i++)
        for (let j = 0; j < COLS; j++) {
            context.fillStyle = COLORS[grid[i][j]];
            context.fillRect(j, i, 1, 1);
        }
    if (pieceObj) renderPiece();
}

function renderNextPiece() {
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const piece = nextPiece.piece;
    const offsetX = Math.floor((4 - piece[0].length) / 2);
    const offsetY = Math.floor((4 - piece.length) / 2);
    nextContext.fillStyle = COLORS[nextPiece.colorIndex];
    for (let i = 0; i < piece.length; i++)
        for (let j = 0; j < piece[i].length; j++)
            if (piece[i][j])
                nextContext.fillRect(j + offsetX, i + offsetY, 1, 1);
}

function collision(x, y) {
    for (let i = 0; i < pieceObj.piece.length; i++)
        for (let j = 0; j < pieceObj.piece[i].length; j++)
            if (pieceObj.piece[i][j]) {
                let p = x + j, q = y + i;
                if (p < 0 || p >= COLS || q >= ROWS || grid[q][p]) return true;
            }
    return false;
}

function checkGrid() {
    let cleared = 0;
    for (let i = ROWS - 1; i >= 0; i--) {
        if (grid[i].every(cell => cell !== 0)) {
            grid.splice(i, 1);
            grid.unshift(new Array(COLS).fill(0));
            cleared++;
            i++;
        }
    }

    if (cleared > 0) {
        score += cleared * 10;
        lineClearSound.play();
        updateLevel();
        updateScore();
    }
}

function updateScore() {
    document.getElementById("score").innerText = "Score: " + score;
}

function flashscore() {
    const scoreEl = document.getElementById("score");
    scoreEl.style.color = "#00ffcc";
    setTimeout(() => (scoreEl.style.color = "#fff"), 300);
}

function updateLevel() {
    let level = Math.floor(score / 100) + 1;
    let newSpeed = Math.max(500 - (level - 1) * 40, 150);
    clearInterval(gameInterval);
    gameInterval = setInterval(newGameState, newSpeed);
    document.getElementById("level").innerText = "Level: " + level;
}

document.addEventListener('keydown', e => {
    if (isPaused) return;
    if (e.code === 'ArrowDown') moveDown();
    else if (e.code === 'ArrowLeft' && !collision(pieceObj.x - 1, pieceObj.y)) pieceObj.x--;
    else if (e.code === 'ArrowRight' && !collision(pieceObj.x + 1, pieceObj.y)) pieceObj.x++;
    else if (e.code === 'ArrowUp') rotate();
    else if (e.code === 'Space') isRunning ? pauseGame() : startGame();
    renderGrid();
});

function rotate() {
    const rotated = pieceObj.piece[0].map((_, idx) => pieceObj.piece.map(row => row[idx]).reverse());
    const oldPiece = pieceObj.piece;
    pieceObj.piece = rotated;
    if (collision(pieceObj.x, pieceObj.y)) pieceObj.piece = oldPiece;
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);