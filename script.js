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
let selectedDifficulty = "4x4"; // Default
let selectedStyle = "default"; // Default card style

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + JSON.stringify(value) + expires + "; path=/";
}

// Function to get a cookie
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

// Start game
function startGame() {
    resetGame();

    // Load difficulty and style from cookies if available
    let savedDifficulty = getCookie("gameDifficulty");
    let savedStyle = getCookie("cardStyle");
    
    if (savedDifficulty) selectedDifficulty = savedDifficulty;
    if (savedStyle) selectedStyle = savedStyle;

    difficultySelector.value = selectedDifficulty;

    const size = selectedDifficulty.split("x").map(Number);
    createCards(size[0] * size[1]);
    setGridSize(size);
    renderCards();
    startTimer();
    loadGameState();
}

// Reset game (DOES NOT reset difficulty/style)
function resetGame() {
    clearInterval(timer);
    flippedCards = [];
    cards = [];
    moveCounter.textContent = "Moves: 0";
    gameOverMessage.textContent = "";
    gameContainer.innerHTML = "";
}

// Create cards
function createCards(numCards) {
    const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, numCards / 2);
    cards = [...symbols, ...symbols];
    cards.sort(() => Math.random() - 0.5);
}

// Adjust the grid dynamically for horizontal layout
function setGridSize(size) {
    let [rows, cols] = size;
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;
}

// Render cards
function renderCards() {
    cards.forEach((symbol, index) => {
        const card = document.createElement("div");
        card.classList.add("card", selectedStyle);
        card.dataset.symbol = symbol;
        card.dataset.index = index;

        card.addEventListener("click", handleCardClick);
        gameContainer.appendChild(card);
    });
}

// Handle card click
function handleCardClick(event) {
    const card = event.target;

    if (flippedCards.length === 2 || card.classList.contains("flipped")) return;

    card.textContent = card.dataset.symbol;
    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        moveCounter.textContent = `Moves: ${moves}`;
        updateTotalMoves(); // Update global move counter

        if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
            flippedCards = [];
            matchedCards += 2;

            if (matchedCards === cards.length) {
                clearInterval(timer);
                gameOverMessage.textContent = "Game Over! You won!";
            }
        } else {
            setTimeout(() => {
                flippedCards.forEach((card) => {
                    card.textContent = "";
                    card.classList.remove("flipped");
                });
                flippedCards = [];
            }, 1000);
        }
    }

    saveGameState();
}

// Start timer
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

// Save the current game state in cookies
function saveGameState() {
    let gameState = {
        moves: moves,
        time: time,
        matchedCards: matchedCards,
        flippedIndices: Array.from(document.querySelectorAll(".flipped")).map(card => card.dataset.index),
        difficulty: selectedDifficulty,
        style: selectedStyle
    };
    setCookie("gameState", gameState, 1);
}

// Load the game state from cookies
function loadGameState() {
    let gameState = getCookie("gameState");
    if (!gameState) return;

    moves = gameState.moves;
    time = gameState.time;
    matchedCards = gameState.matchedCards;
    selectedDifficulty = gameState.difficulty;
    selectedStyle = gameState.style;

    difficultySelector.value = selectedDifficulty;
    moveCounter.textContent = `Moves: ${moves}`;
    timerDisplay.textContent = `Time: ${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;

    document.querySelectorAll(".card").forEach((card) => {
        if (gameState.flippedIndices.includes(card.dataset.index)) {
            card.textContent = card.dataset.symbol;
            card.classList.add("flipped");
        }
    });
}

// Update global total move count across tabs
function updateTotalMoves() {
    let totalMoves = localStorage.getItem("totalMoves");
    totalMoves = totalMoves ? parseInt(totalMoves) + 1 : 1;
    localStorage.setItem("totalMoves", totalMoves);
}

// Listen for changes in total move count across tabs
window.addEventListener("storage", (event) => {
    if (event.key === "totalMoves") {
        console.log(`Total moves updated across tabs: ${event.newValue}`);
    }
});

// Save difficulty when changed
difficultySelector.addEventListener("change", () => {
    selectedDifficulty = difficultySelector.value;
    setCookie("gameDifficulty", selectedDifficulty, 1);
    startGame(); // Restart with the same difficulty
});

// Save style selection (if you have different card styles)
function setCardStyle(style) {
    selectedStyle = style;
    setCookie("cardStyle", selectedStyle, 1);
    document.querySelectorAll(".card").forEach(card => {
        card.classList.remove("default", "fancy"); // Remove other styles
        card.classList.add(selectedStyle);
    });
}

// Event listeners
restartBtn.addEventListener("click", startGame);

// Initialize the game
startGame();
