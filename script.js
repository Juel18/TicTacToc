const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const modeSelect = document.getElementById("modeSelect");
const difficultySelect = document.getElementById("difficultySelect");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const scoreBoard = document.getElementById("scoreBoard");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let playerXScore = 0;
let playerOScore = 0;
let drawCount = 0;
let lockSettings = false;

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function createBoard() {
  boardElement.innerHTML = "";
  board.forEach((_, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    boardElement.appendChild(cell);
  });
  statusElement.textContent = `Player ${currentPlayer}'s turn`;
  if (!lockSettings) {
    lockSettings = true;
    modeSelect.disabled = true;
    difficultySelect.disabled = true;
  }
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index] !== "") return;
  makeMove(index, currentPlayer);
  clickSound.play();
  if (modeSelect.value === "ai" && gameActive && currentPlayer === "O") {
    setTimeout(() => aiMove(), 500);
  }
}

function makeMove(index, player) {
  board[index] = player;
  document.querySelector(`[data-index='${index}']`).textContent = player;
  checkGameStatus();
  if (gameActive) {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusElement.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function checkGameStatus() {
  let won = false;
  winConditions.forEach(condition => {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      won = board[a];
    }
  });
  if (won) {
    statusElement.textContent = `Player ${won} wins!`;
    if (won === "X") playerXScore++;
    else playerOScore++;
    winSound.play();
    gameActive = false;
    updateScore();
    setTimeout(resetGame, 2000);
    return;
  }
  if (!board.includes("")) {
    statusElement.textContent = "Draw!";
    drawCount++;
    gameActive = false;
    updateScore();
    setTimeout(resetGame, 2000);
  }
}

function aiMove() {
  let difficulty = difficultySelect.value;
  let index;

  if (difficulty === "easy") {
    let available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    index = available[Math.floor(Math.random() * available.length)];
  } else if (difficulty === "medium") {
    index = mediumAIMove();
  } else {
    index = minimax(board, "O").index;
  }

  if (index !== undefined) makeMove(index, "O");
}

function mediumAIMove() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "O";
      if (checkWinner("O")) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "X";
      if (checkWinner("X")) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  return board.findIndex(c => c === "");
}

function checkWinner(player) {
  return winConditions.some(([a, b, c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
}

function minimax(newBoard, player) {
  const huPlayer = "X";
  const aiPlayer = "O";
  const availSpots = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);

  if (checkWinner(huPlayer)) return { score: -10 };
  if (checkWinner(aiPlayer)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  let moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    let move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    let result = minimax(newBoard, player === aiPlayer ? huPlayer : aiPlayer);
    move.score = result.score;

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function updateScore() {
  scoreBoard.textContent = `X: ${playerXScore} | O: ${playerOScore} | Draws: ${drawCount}`;
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  createBoard();
}

createBoard();
