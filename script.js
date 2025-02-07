const gameContainer = document.getElementById("game-container");
const moveCounter = document.getElementById("move-counter");
const timerDisplay = document.getElementById("timer");
const gameOverMessage = document.getElementById("game-over");
const difficultySelector = document.getElementById("difficulty");
const restartBtn = document.getElementById("restart-btn");

let cards = [];
let flippedCards = [];
let matchedCards = 0;
let moves = 0;
let timer;
let time = 0;
let selectedDifficulty = "4x4"; // Default difficulty

// Cookie utility functions
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + JSON.stringify(value) + expires + "; path=/";
}

function getCookie(name) {
    let cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) {
            return JSON.parse(cookieValue);
        }
    }
    return null;
}

// Start game (load from saved state or start fresh)
function startGame() {
    resetGame();

    const savedDifficulty = getCookie("gameDifficulty");
    const savedOrder = getCookie("cardOrder");

    if (savedDifficulty) selectedDifficulty = savedDifficulty;
    difficultySelector.value = selectedDifficulty;

    const size = selectedDifficulty.split("x").map(Number);

    // Use saved card order if available, otherwise shuffle new cards
    if (savedOrder) {
        cards = savedOrder;
    } else {
        createCards(size[0] * size[1]);
        setCookie("cardOrder", cards, 1);
    }

    setGridSize(size);
    renderCards();
    startTimer();
    loadGameState();
}

// Reset game state but keep difficulty
function resetGame() {
    clearInterval(timer);
    flippedCards = [];
    cards = [];
    moves = 0;
    matchedCards = 0;
    time = 0;
    moveCounter.textContent = "Moves: 0";
    timerDisplay.textContent = "Time: 00:00";
    gameOverMessage.textContent = "";
    gameContainer.innerHTML = "";
}

// Create and shuffle cards
function createCards(numCards) {
    const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, numCards / 2);
    cards = [...symbols, ...symbols];
    cards.sort(() => Math.random() - 0.5);
}

// Set grid size dynamically
function setGridSize(size) {
    const [rows, cols] = size;
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;
}

// Render cards on the grid
function renderCards() {
    cards.forEach((symbol, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;
        card.dataset.index = index;

        card.addEventListener("click", handleCardClick);
        gameContainer.appendChild(card);
    });
}

// Handle card flipping logic
function handleCardClick(event) {
    const card = event.target;

    if (flippedCards.length === 2 || card.classList.contains("flipped")) return;

    card.textContent = card.dataset.symbol;
    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        moveCounter.textContent = `Moves: ${moves}`;
        updateTotalMoves(); // Track moves across tabs

        if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
            flippedCards = [];
            matchedCards += 2;

            if (matchedCards === cards.length) {
                clearInterval(timer);
                gameOverMessage.textContent = "Game Over! You won!";
            }
        } else {
            setTimeout(() => {
                flippedCards.forEach(card => {
                    card.textContent = "";
                    card.classList.remove("flipped");
                });
                flippedCards = [];
            }, 1000);
        }
    }

    saveGameState();
}

// Start and update the timer
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        time++;
        const minutes = String(Math.floor(time / 60)).padStart(2, "0");
        const seconds = String(time % 60).padStart(2, "0");
        timerDisplay.textContent = `Time: ${minutes}:${seconds}`;
        saveGameState();
    }, 1000);
}

// Save game state to cookies
function saveGameState() {
    const gameState = {
        moves: moves,
        time: time,
        matchedCards: matchedCards,
        flippedIndices: Array.from(document.querySelectorAll(".flipped")).map(card => card.dataset.index),
        difficulty: selectedDifficulty,
        cardOrder: cards
    };
    setCookie("gameState", gameState, 1);
}

// Load game state from cookies
function loadGameState() {
    const gameState = getCookie("gameState");
    if (!gameState) return;

    moves = gameState.moves;
    time = gameState.time;
    matchedCards = gameState.matchedCards;
    cards = gameState.cardOrder;

    moveCounter.textContent = `Moves: ${moves}`;
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    timerDisplay.textContent = `Time: ${minutes}:${seconds}`;

    document.querySelectorAll(".card").forEach(card => {
        if (gameState.flippedIndices.includes(card.dataset.index)) {
            card.textContent = card.dataset.symbol;
            card.classList.add("flipped");
        }
    });
}

// Track total moves across tabs
function updateTotalMoves() {
    let totalMoves = localStorage.getItem("totalMoves");
    totalMoves = totalMoves ? parseInt(totalMoves) + 1 : 1;
    localStorage.setItem("totalMoves", totalMoves);
}

// Listen for changes in total moves across tabs
window.addEventListener("storage", event => {
    if (event.key === "totalMoves") {
        console.log(`Total moves updated across tabs: ${event.newValue}`);
    }
});

// Event listener for difficulty change
difficultySelector.addEventListener("change", () => {
    selectedDifficulty = difficultySelector.value;
    setCookie("gameDifficulty", selectedDifficulty, 1);
    startGame();
});

// Event listener for New Game button
restartBtn.addEventListener("click", () => {
    clearGameState();
    shuffleAndStartGame();
});

// Clear game state without affecting difficulty
function clearGameState() {
    setCookie("gameState", null, -1);
    setCookie("cardOrder", null, -1);
}

// Shuffle and start a new game
function shuffleAndStartGame() {
    resetGame();
    createCards(difficultySelector.value.split("x").reduce((a, b) => a * b));
    setCookie("cardOrder", cards, 1);
    renderCards();
    startTimer();
}

// Initialize game on page load
startGame();
