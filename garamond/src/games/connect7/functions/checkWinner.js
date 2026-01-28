/**
 * Check for a winner in Connect 10
 * A player wins when any continuous combination of their pieces equals 10
 * (e.g., 1+3+3+3 = 10, or 2+2+3+3 = 10, or 1+1+1+2+2+3 = 10)
 */
export function checkWinner(board, columns, rows) {
  const TARGET_SUM = 10;

  // Helper function to check a sequence of cells
  const checkSequence = (indices) => {
    const cells = indices.map(idx => board[idx]);
    
    // Check all possible continuous subsequences
    for (let start = 0; start < cells.length; start++) {
      // Skip empty starting cells
      if (!cells[start].player) continue;
      
      let sum = 0;
      let player = cells[start].player;
      const winningIndices = [];
      
      for (let end = start; end < cells.length; end++) {
        // Break if we encounter a different player or empty cell
        if (!cells[end].player || cells[end].player !== player) break;
        
        sum += cells[end].value;
        winningIndices.push(indices[end]);
        
        // Check if we hit the target sum
        if (sum === TARGET_SUM) {
          return {
            winner: player,
            winningCells: winningIndices,
          };
        }
        
        // Stop if sum exceeds target
        if (sum > TARGET_SUM) break;
      }
    }
    
    return null;
  };

  // Check all horizontal rows
  for (let row = 0; row < rows; row++) {
    const indices = [];
    for (let col = 0; col < columns; col++) {
      indices.push(row * columns + col);
    }
    const result = checkSequence(indices);
    if (result) return result;
  }

  // Check all vertical columns
  for (let col = 0; col < columns; col++) {
    const indices = [];
    for (let row = 0; row < rows; row++) {
      indices.push(row * columns + col);
    }
    const result = checkSequence(indices);
    if (result) return result;
  }

  // Check all diagonals (top-left to bottom-right)
  // Start from each position in first row and first column
  for (let startRow = 0; startRow < rows; startRow++) {
    const indices = [];
    let row = startRow;
    let col = 0;
    while (row < rows && col < columns) {
      indices.push(row * columns + col);
      row++;
      col++;
    }
    if (indices.length >= 2) {
      const result = checkSequence(indices);
      if (result) return result;
    }
  }
  
  for (let startCol = 1; startCol < columns; startCol++) {
    const indices = [];
    let row = 0;
    let col = startCol;
    while (row < rows && col < columns) {
      indices.push(row * columns + col);
      row++;
      col++;
    }
    if (indices.length >= 2) {
      const result = checkSequence(indices);
      if (result) return result;
    }
  }

  // Check all diagonals (top-right to bottom-left)
  // Start from each position in first row and last column
  for (let startRow = 0; startRow < rows; startRow++) {
    const indices = [];
    let row = startRow;
    let col = columns - 1;
    while (row < rows && col >= 0) {
      indices.push(row * columns + col);
      row++;
      col--;
    }
    if (indices.length >= 2) {
      const result = checkSequence(indices);
      if (result) return result;
    }
  }
  
  for (let startCol = columns - 2; startCol >= 0; startCol--) {
    const indices = [];
    let row = 0;
    let col = startCol;
    while (row < rows && col >= 0) {
      indices.push(row * columns + col);
      row++;
      col--;
    }
    if (indices.length >= 2) {
      const result = checkSequence(indices);
      if (result) return result;
    }
  }

  // No winner
  return { winner: null, winningCells: [] };
}
