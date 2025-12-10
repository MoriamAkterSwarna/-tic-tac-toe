// Game State Variables
let gameBoard = ["", "", "", "", "", "", "", "", ""]; // Array to track cell values
let currentPlayer = "X"; // Current player (X starts first)
let gameActive = true; // Flag to check if game is still ongoing

// DOM Elements
const cells = document.querySelectorAll(".cell");
const turnText = document.getElementById("turnText");
const statusMessage = document.getElementById("statusMessage");
const restartBtn = document.getElementById("restartBtn");

// Winning Combinations (indices of winning patterns)
const winningConditions = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal (top-left to bottom-right)
  [2, 4, 6], // Diagonal (top-right to bottom-left)
];

// Initialize Game - Add event listeners to cells
function initializeGame() {
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });
  restartBtn.addEventListener("click", restartGame);
}

// Handle Cell Click Event
function handleCellClick(event) {
  const clickedCell = event.target;
  const clickedIndex = parseInt(clickedCell.getAttribute("data-index"));

  // Check if cell is already taken or game is not active or if it's O's turn
  if (gameBoard[clickedIndex] !== "" || !gameActive || currentPlayer === "O") {
    return;
  }

  // Update game state and UI
  updateCell(clickedCell, clickedIndex);
  checkResult();
}

// Update Cell with Current Player's Mark
function updateCell(cell, index) {
  gameBoard[index] = currentPlayer; // Update array
  cell.textContent = currentPlayer; // Display X or O
  cell.classList.add("taken"); // Mark as taken
  cell.classList.add(currentPlayer.toLowerCase()); // Add color class
}

// Check for Winner or Draw
function checkResult() {
  let roundWon = false;
  let winningCombination = [];

  // Loop through all winning conditions
  for (let i = 0; i < winningConditions.length; i++) {
    const condition = winningConditions[i];
    const a = gameBoard[condition[0]];
    const b = gameBoard[condition[1]];
    const c = gameBoard[condition[2]];

    // Skip if any position is empty
    if (a === "" || b === "" || c === "") {
      continue;
    }

    // Check if all three positions have the same value
    if (a === b && b === c) {
      roundWon = true;
      winningCombination = condition;
      break;
    }
  }

  // Handle Win
  if (roundWon) {
    announceWinner(winningCombination);
    return;
  }

  // Check for Draw (all cells filled, no winner)
  if (!gameBoard.includes("")) {
    announceDraw();
    return;
  }

  // Continue Game - Switch Player
  switchPlayer();
}

// Announce Winner
function announceWinner(winningCombination) {
  statusMessage.textContent = `Player ${currentPlayer} Wins! 🎉`;
  statusMessage.classList.add("winner-message");
  turnText.textContent = "Game Over";
  gameActive = false;

  // Highlight winning cells
  winningCombination.forEach((index) => {
    cells[index].classList.add("winner");
  });
}

// Announce Draw
function announceDraw() {
  statusMessage.textContent = "It's a Draw! 🤝";
  statusMessage.classList.add("draw-message");
  turnText.textContent = "Game Over";
  gameActive = false;
}

// Switch Current Player
function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  turnText.textContent = `Player ${currentPlayer}'s Turn`;

  // If it's O's turn (computer), make automatic move after short delay
  if (currentPlayer === "O" && gameActive) {
    setTimeout(makeComputerMove, 500); // 500ms delay for better UX
  }
}

// Computer (O) makes automatic move
function makeComputerMove() {
  if (!gameActive) return;

  // Strategy: Try to win, block opponent, or take best available spot
  let moveIndex = findBestMove();

  if (moveIndex !== -1) {
    const cell = cells[moveIndex];
    updateCell(cell, moveIndex);
    checkResult();
  }
}

// Find the best move for computer
function findBestMove() {
  // 1. Check if computer can win in next move
  let move = findWinningMove("O");
  if (move !== -1) return move;

  // 2. Block player from winning
  move = findWinningMove("X");
  if (move !== -1) return move;

  // 3. Take center if available
  if (gameBoard[4] === "") return 4;

  // 4. Take a corner
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => gameBoard[i] === "");
  if (availableCorners.length > 0) {
    return availableCorners[
      Math.floor(Math.random() * availableCorners.length)
    ];
  }

  // 5. Take any available spot
  const availableSpots = gameBoard
    .map((val, idx) => (val === "" ? idx : null))
    .filter((val) => val !== null);
  return availableSpots.length > 0 ? availableSpots[0] : -1;
}

// Find winning move for given player
function findWinningMove(player) {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    const values = [gameBoard[a], gameBoard[b], gameBoard[c]];

    // Count how many positions this player has in this winning line
    const playerCount = values.filter((v) => v === player).length;
    const emptyCount = values.filter((v) => v === "").length;

    // If player has 2 in a row and one empty spot, that's the winning/blocking move
    if (playerCount === 2 && emptyCount === 1) {
      if (gameBoard[a] === "") return a;
      if (gameBoard[b] === "") return b;
      if (gameBoard[c] === "") return c;
    }
  }
  return -1;
}

// Restart Game - Reset Everything
function restartGame() {
  // Reset game state
  gameBoard = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;

  // Reset UI
  turnText.textContent = "Player X's Turn";
  statusMessage.textContent = "";
  statusMessage.classList.remove("winner-message", "draw-message");

  // Clear all cells
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "x", "o", "winner");
  });
}

// Start the game when page loads
initializeGame();
