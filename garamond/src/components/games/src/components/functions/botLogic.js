class TicTacToe {
  constructor() {
    // The board is a 3x3 grid represented by a flat array (9 cells)
    this.board = Array(9).fill(0); 
    this.players = [1, 2]; // Player 1 and Player 2
    this.currentPlayer = 1; // Player 1 starts
    this.piecesLeft = {
      1: [2, 2, 2], // Player 1: 2x 1's, 2x 2's, 2x 3's
      2: [2, 2, 2], // Player 2: 2x 1's, 2x 2's, 2x 3's
    };
  }

  // Check if there is a winner (1 for Player 1, 2 for Player 2, 0 for no winner)
  checkWinner() {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const [a, b, c] of winningCombinations) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a]; // Return the winning player (1 or 2)
      }
    }
    return 0; // No winner
  }

  // Check if the game is a draw (no more valid moves and no winner)
  isDraw() {
    return this.board.every(cell => cell !== 0);
  }

  // Evaluate the game state: 1 for Player 1 win, -1 for Player 2 win, 0 for draw
  evaluate() {
    const winner = this.checkWinner();
    if (winner === 1) return 1; // Player 1 wins
    if (winner === 2) return -1; // Player 2 wins
    return 0; // Draw
  }

  // Get the available moves (empty spots where the current player can place a tile)
  getAvailableMoves() {
    return this.board
      .map((value, index) => value === 0 ? index : -1)
      .filter(index => index !== -1);
  }

  // Check if a move is valid based on the current player's available tiles
  isValidMove(position, tileValue) {
    if (this.board[position] === 0) return true; // Empty space is always valid
    if (this.board[position] < tileValue && this.board[position] !== 0) return true; // Can take over if own tile is higher
    return false; // Otherwise, the move is invalid
  }

  // Minimax with Alpha-Beta Pruning
  minimax(alpha, beta, isMaximizingPlayer, tileValue) {
    const availableMoves = this.getAvailableMoves();
    if (availableMoves.length === 0 || this.checkWinner() !== 0) {
      return this.evaluate(); // Base case: evaluate the board state
    }

    if (isMaximizingPlayer) {
      let maxevalu= -Infinity;
      for (let move of availableMoves) {
        // Try all available moves
        if (this.isValidMove(move, tileValue)) {
          // Make the move
          this.board[move] = tileValue;
          this.piecesLeft[this.currentPlayer][tileValue - 1]--; // Decrease the pieces left
          this.currentPlayer = 3 - this.currentPlayer; // Switch player
          
          const evalu= this.minimax(alpha, beta, false, tileValue); // Minimize for opponent
          
          // Undo the move
          this.board[move] = 0;
          this.piecesLeft[this.currentPlayer][tileValue - 1]++;
          this.currentPlayer = 3 - this.currentPlayer; // Switch back to the current player
          
          maxevalu= Math.max(maxevalu, eval);
          alpha = Math.max(alpha, eval);
          if (beta <= alpha) break; // Beta cut-off
        }
      }
      return maxevalu;
    } else {
      let minevalu= Infinity;
      for (let move of availableMoves) {
        // Try all available moves
        if (this.isValidMove(move, tileValue)) {
          // Make the move
          this.board[move] = tileValue;
          this.piecesLeft[this.currentPlayer][tileValue - 1]--; // Decrease the pieces left
          this.currentPlayer = 3 - this.currentPlayer; // Switch player
          
          const evalu= this.minimax(alpha, beta, true, tileValue); // Maximize for Player 1
          
          // Undo the move
          this.board[move] = 0;
          this.piecesLeft[this.currentPlayer][tileValue - 1]++;
          this.currentPlayer = 3 - this.currentPlayer; // Switch back to the current player
          
          minevalu= Math.min(minevalu, eval);
          beta = Math.min(beta, eval);
          if (beta <= alpha) break; // Alpha cut-off
        }
      }
      return minevalu;
    }
  }

  // Get the best move for the current player using minimax
  getBestMove() {
    let bestMove = -1;
    let bestValue = -Infinity;
    const availableMoves = this.getAvailableMoves();
    
    for (let move of availableMoves) {
      for (let tileValue = 1; tileValue <= 3; tileValue++) {
        if (this.isValidMove(move, tileValue)) {
          this.board[move] = tileValue;
          this.piecesLeft[this.currentPlayer][tileValue - 1]--; // Use a piece
          this.currentPlayer = 3 - this.currentPlayer; // Switch player
          
          const moveValue = this.minimax(-Infinity, Infinity, false, tileValue);
          
          this.board[move] = 0;
          this.piecesLeft[this.currentPlayer][tileValue - 1]++; // Restore the piece
          this.currentPlayer = 3 - this.currentPlayer; // Switch back to the current player
          
          if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
          }
        }
      }
    }
    
    return bestMove;
  }

  // Play the best move for AI (Player 2)
  playAIMove() {
    const bestMove = this.getBestMove();
    const tileValue = 3; // AI always uses the highest tile available (in this example, Player 2 uses tile 3)
    this.board[bestMove] = tileValue; // AI (Player 2) plays
    this.piecesLeft[2][tileValue - 1]--; // Decrease the pieces left for AI
    this.currentPlayer = 1; // Switch to Player 1
  }

  // Display the board for debugging
  displayBoard() {
    const board = this.board.map(cell => (cell === 0 ? '_' : cell));
    console.log(`${board[0]} ${board[1]} ${board[2]}`);
    console.log(`${board[3]} ${board[4]} ${board[5]}`);
    console.log(`${board[6]} ${board[7]} ${board[8]}`);
  }
}

// Example usage:
const game = new TicTacToe();
game.displayBoard();

// Simulate a few moves
game.board[0] = 1; // Player 1 (X) moves
game.board[1] = 2; // Player 2 (O) moves
game.displayBoard();

// Let AI (Player 2) make its move
game.playAIMove();
game.displayBoard();
