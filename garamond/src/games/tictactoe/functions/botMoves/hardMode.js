// Shared helpers for future hard-mode logic
import {
  pieceCounts,
  piecesUsed,
  computeUsed3s,
  maxOppValue,
  validPiecesForMove,
  getPositionValue,
  openingMoves
} from '../helperFunctions/strategyHelpers';
import { checkWinner, winningLines } from '../helperFunctions/checkWinner';
import { countPlayerInLine} from '../helperFunctions/botmovelogic';
import { getMaxAvailablePieceValue } from '../helperFunctions/pieceHelpers';
import { valuesMap } from '../helperFunctions/pieceHelpers';

// Hard Mode
export function getHardMove(board, context) {
  // This function will assess each square on the board and assign a score based on strategic factors.
  // The highest scoring move will be selected. From there, the best piece to use will be chosen.

  const {
    availablePieceIndices,
    availableMoves,
    botPlayer,
    opponent,
    winningConditions,
    deadO,
    deadX
  } = context;

  const weights = {
    win: 0.35,
    block: 0.325,
    setup: 0.125,
    middle: 0.1,
    takeover: 0.075,
    corners: 0.025
  }

  const roundcounter = deadO.filter(Boolean).length + deadX.filter(Boolean).length
  
  // Initialize piece scores
  const pieceScores = {
    1: 0,
    2: 0,
    3: 0
  };

  // Initialize move scores for all board positions
  const moveScores = Array.from({ length: 9 }, (_, idx) => ({ 
    index: idx, 
    score: 0 
  }));

  // Assessing the board:
  availableMoves().forEach((tile, idx) => {
    // For each tile in availableMoves, consider:
    // - What is the positional value of the tile?
    // - What pieces are available to play here?
    // - How does this move affect winning chances, threats, and setups?

    //1. WIN: Can we win by playing here?
      // Append tile to board (sim) and check winning conditions
      let simboard = board.map(t => ({ ...t })); // Fresh copy for this tile
      simboard[tile] = { player: botPlayer, value: 3 }; // Assume max piece for simulation
      if(checkWinner(simboard)){moveScores[tile].score += weights.win};

    //2. BLOCK: Can we block an opponent win here?
      // First: Check if opponent would win by placing here (only valid if tile is empty)
      simboard = board.map(t => ({ ...t })); // Reset simboard
      simboard[tile] = { player: opponent, value: 3 }; // Assume max piece for simulation
      if(checkWinner(simboard)){
        // Opponent wins by taking this empty tile - definite block
        moveScores[tile].score += weights.block;
      } else {
        // Opponent didn't win by taking this tile
        // Check if opponent has 2 of 3 in any line using this tile
        const lines = winningLines(tile);
        for (let condition of lines) {
          const line = condition.map(i => board[i]);
          const values = line.map(t => t.player);
          // Does opponent have exactly 2 in this line?
          if (countPlayerInLine(values, opponent) === 2) {
            // Find the third tile (not opponent's)
            const thirdTile = line.find(t => t.player !== opponent);
            if (thirdTile) {
              if (thirdTile.player === botPlayer) {
                // Bot owns the third tile - check if opponent can overtake it
                if (thirdTile.value < maxOppValue(deadX)) {
                  // Opponent could win by overtaking bot's piece
                  moveScores[tile].score += weights.block;
                  break;
                }
              } else if (thirdTile.player === null) {
                // Third tile is empty - taking opponent's piece here prevents setup
                moveScores[tile].score += weights.block;
                break;
              }
            }
          }
        }
      }
      
    // 3. Further the win
      // Bot has 1 tile in winning line
      // Any opponent pieces in winning line are less than max value left by bot
      // How many winning lines are furthered by this move?
        const lines = winningLines(tile);
        let furtheringcount = 0;
        
        for (let condition of lines) {
          const line = condition.map(i => board[i]);
          const values = line.map(t => t.player);
          
          // Check if bot has exactly 1 in this line (setup for 2-in-a-row)
          if (countPlayerInLine(values, botPlayer) === 1) {
            const oppTiles = line.filter(t => t.player === opponent);
            
            if (oppTiles.length === 0) {
              // No opponent pieces - clean setup opportunity
              furtheringcount++;
            } else {
              // Opponent has pieces - check if all are overtakeable
              const allOvertakeable = oppTiles.every(t => t.value < getMaxAvailablePieceValue(deadO));
              if (allOvertakeable) {
                furtheringcount++;
              }
            }
          }
        }
        
        // Add setup score multiplied by number of lines furthered
        if (furtheringcount > 0) {
          moveScores[tile].score += weights.setup + (0.1 * furtheringcount);
        }

    // 4. Middle
        // Only if roundcounter > 3
        if (roundcounter > 3 && tile == 4){
          moveScores[tile].score += weights.middle
        }

    // 5. Takeover
        // If opponent owns the tile
        if (board[tile].player === opponent){moveScores[tile].score += weights.takeover * (board[tile].value / 2)}
    
    // 6. Corners
        // If the piece is a corner there is a higher weight
        if (tile === 0 || tile === 2 || tile === 6 || tile === 8){moveScores[tile].score += weights.corners}
  });

  // Find highest score
  const bestMove = moveScores.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  console.log('Move Scores: ', moveScores);
  console.log('Best Move: ', bestMove);

//---------------------------------------------------------
  // Select the Bot piece to play
    // What bot pieces can be played here?
    const pValue = board[bestMove.index].value || 0
    // Find all possible pieces that can be played
    // This is either everything if it is blank or 2/3 if opponent has ownership of tile
    const validPieceIndices = availablePieceIndices().filter(i => valuesMap[i] > pValue);
    const validPieceValues = validPieceIndices.map(i => valuesMap[i]);
    
    if(!validPieceValues.includes(1)){pieceScores[1] = -10}
    if(!validPieceValues.includes(2)){pieceScores[2] = -10}
    if(!validPieceValues.includes(3)){pieceScores[3] = -10}

    // The actual move is going to depend on what the opponent has
    // 1. Don't use 3's first
    // 2. Prefer minimum when empty, minimum during takeover, and maximum when blocking, don't block with something less than opponent has
      // This is going to depend on the score - if the score is higher than 0.15 then go high

    // Find out if opponent has 3's left
    const opp3Count = [deadX[4], deadX[5]].filter(used => !used).length;
    // How many 3's does bot have left
    const bot3Count = [deadO[4], deadO[5]].filter(used => !used).length;
    // If bot3Count >= opp3Count then there should be a penalty with using a 3
    if(bot3Count >= opp3Count){pieceScores[3] += -.5}

    // If pValue is 0 then prefer minimum if score is under .15
    if (pValue === 0 && bestMove.score < .15){
      //Prefer minimum
      pieceScores[1] += 1
      pieceScores[2] += 0.5
      pieceScores[3] += 0.1
    } else if(bestMove.score < .15 && bot3Count >= opp3Count){
      pieceScores[2] += (0.5 + (.15-bestMove.score))
    } else if(bestMove.score > .3) {
      pieceScores [3] += (0.5 + (bestMove.score - .3))
    }

    const bestPieceValue = Object.keys(pieceScores).reduce((best, current) => 
    pieceScores[current] > pieceScores[best] ? current : best);

    const bestPiece = Number(bestPieceValue);

    // find index of bot's pieces which matches the bestpiece
    // To get the index in the validPieceIndices array that has a specific value
    const chosenPieceIdx = validPieceIndices.find(i => valuesMap[i] === bestPiece);
    // Returns the actual piece index (0-5) for a piece with value 2
  
    console.log('Piece Scores: ', pieceScores);
    console.log('Best Piece: ', bestPiece);
    console.log('Piece Index: ', chosenPieceIdx);
    // After finding bestMove and choosing piece
return {
  moveIdx: bestMove.index,
  pieceIdx: chosenPieceIdx,
  moveReason: 'hard-mode'
};
  } 
