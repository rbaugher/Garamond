/**
 * Check for completed lines in Reactor Control (Connect 10)
 * Returns all NEW lines that sum to exactly 10
 * Both players' nodes count toward line totals
 * A line scores for the player who completed it with their last move
 */
export function checkWinner(board, columns, rows, existingCompletedLines = [], lastMove = null) {
  const TARGET_SUM = 10;
  const newCompletedLines = [];
  let lineIdCounter = existingCompletedLines.length;

  // Helper to check if a set of cells is already in completed lines
  const isAlreadyCompleted = (cells) => {
    const cellSet = new Set(cells.sort((a, b) => a - b));
    return existingCompletedLines.some(line => {
      const lineSet = new Set(line.cells.sort((a, b) => a - b));
      if (lineSet.size !== cellSet.size) return false;
      for (const cell of cellSet) {
        if (!lineSet.has(cell)) return false;
      }
      return true;
    });
  };

  // Helper function to check a sequence of cells for ANY 10-sum subsequence
  const checkSequence = (indices) => {
    const cells = indices.map(idx => board[idx]);
    const foundLines = [];
    
    // Check all possible continuous subsequences
    for (let start = 0; start < cells.length; start++) {
      // Skip empty starting cells
      if (cells[start].value === null) continue;
      
      let sum = 0;
      const winningIndices = [];
      
      for (let end = start; end < cells.length; end++) {
        // Break if we encounter an empty cell
        if (cells[end].value === null) break;
        
        sum += cells[end].value;
        winningIndices.push(indices[end]);
        
        // Check if we hit the target sum
        if (sum === TARGET_SUM) {
          // Check if this line is already completed
          if (!isAlreadyCompleted(winningIndices)) {
            foundLines.push([...winningIndices]);
          }
        }
        
        // Stop if sum exceeds target
        if (sum > TARGET_SUM) break;
      }
    }
    
    return foundLines;
  };

  const allPotentialLines = [];

  // Check all horizontal rows
  for (let row = 0; row < rows; row++) {
    const indices = [];
    for (let col = 0; col < columns; col++) {
      indices.push(row * columns + col);
    }
    allPotentialLines.push(...checkSequence(indices));
  }

  // Check all vertical columns
  for (let col = 0; col < columns; col++) {
    const indices = [];
    for (let row = 0; row < rows; row++) {
      indices.push(row * columns + col);
    }
    allPotentialLines.push(...checkSequence(indices));
  }

  // Check all diagonals (top-left to bottom-right)
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
      allPotentialLines.push(...checkSequence(indices));
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
      allPotentialLines.push(...checkSequence(indices));
    }
  }

  // Check all diagonals (top-right to bottom-left)
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
      allPotentialLines.push(...checkSequence(indices));
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
      allPotentialLines.push(...checkSequence(indices));
    }
  }

  // Convert found lines to completed line objects
  // The player who gets credit is the one who made the last move that completed it
  for (const lineCells of allPotentialLines) {
    newCompletedLines.push({
      player: lastMove?.player || null,
      cells: lineCells,
      lineId: lineIdCounter++,
    });
  }

  return newCompletedLines;
}
