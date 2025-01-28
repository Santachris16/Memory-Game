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

// Start game
function startGame() {
    resetGame();
    const size = difficultySelector.value.split("x").map(Number);
    createCards(size[0] * size[1]);
    setGridSize(size);
    renderCards();
    startTimer();
}

// Reset game
function resetGame() {
    clearInterval(timer);
    time = 0;
    moves = 0;
    matchedCards = 0;
    flippedCards = [];
    cards = [];
    moveCounter.textContent = "Moves: 0";
    timerDisplay.textContent = "Time: 00:00";
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

    if ((rows * cols) % 2 !== 0) {
        cols +=1;
    }
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;
}

// Render cards
function renderCards() {
    cards.forEach((symbol) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;

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
}

// Start timer
function startTimer() {
    timer = setInterval(() => {
        time++;
        const minutes = String(Math.floor(time / 60)).padStart(2, "0");
        const seconds = String(time % 60).padStart(2, "0");
        timerDisplay.textContent = `Time: ${minutes}:${seconds}`;
    }, 1000);
}

// Event listeners
difficultySelector.addEventListener("change", startGame);
restartBtn.addEventListener("click", startGame);

// Initialize the game
startGame();
