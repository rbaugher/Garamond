// Shared winning conditions
const winningConditions = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6]
];

// Checks for a winner in the board array
export function checkWinner(board) {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (
      board[a].player !== null &&
      board[a].player === board[b].player &&
      board[a].player === board[c].player
    ) {
      return { player: board[a].player, winningTiles: condition };
    }
  }
  return null;
}

export function winningLines(boardIndex) {
  return winningConditions.filter(condition => condition.includes(boardIndex));
}