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
    block: 0.25,
    setup: 0.175,
    takeover: 0.125,
    middle: 0.075,
    corners: 0.025
  }

  const roundcounter = deadO.filter(Boolean).length + deadX.filter(Boolean).length
  
  // Initialize piece scores
  let pieceScores = {
    1: 0,
    2: 0,
    3: 0
  };

  // Initialize move scores for all board positions
  let moveScores = Array.from({ length: 9 }, (_, idx) => ({ 
    index: idx, 
    score: 0,
    reason: ""
  }));

  const availableMovesArray = availableMoves();
  console.log('Available Moves:', availableMovesArray);
  console.log('Weights:', weights);

  // Assessing the board:
  availableMovesArray.forEach((tile, idx) => {
    // For each tile in availableMoves, consider:
    // - What is the positional value of the tile?
    // - What pieces are available to play here?
    // - How does this move affect winning chances, threats, and setups?

    //1. WIN: Can we win by playing here?
      // Append tile to board (sim) and check winning conditions
      let simboard = board.map(t => ({ ...t })); // Fresh copy for this tile
      simboard[tile] = { player: botPlayer, value: 3 }; // Assume max piece for simulation
      if(checkWinner(simboard)){
        moveScores[tile].score += weights.win;
        moveScores[tile].reason += "-Win"
      }

    //2. BLOCK: Can we block an opponent win here?
      // First: Check if opponent would win by placing here (only valid if tile is empty)
      simboard = board.map(t => ({ ...t })); // Reset simboard
      simboard[tile] = { player: opponent, value: 3 }; // Assume max piece for simulation
      if(checkWinner(simboard)){
        // Opponent wins by taking this empty tile - definite block
        moveScores[tile].score += weights.block;
        moveScores[tile].reason += "-Block"
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
                  moveScores[tile].reason += "-Block"
                  break;
                }
              } else if (thirdTile.player === null) {
                // Third tile is empty - taking opponent's piece here prevents setup
                moveScores[tile].score += weights.block;
                moveScores[tile].reason += "-Block"
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
          moveScores[tile].score += weights.setup + (0.1 * furtheringcount)/2;
          moveScores[tile].reason += "-Furthering"
        }

    // 4. Middle
        // Only if roundcounter > 3
        if (roundcounter > 3 && tile == 4){
          moveScores[tile].score += weights.middle
          moveScores[tile].reason += "-Middle"
        }

    // 5. Takeover
        // If opponent owns the tile
        if (board[tile].player === opponent){
          moveScores[tile].score += weights.takeover * (2*board[tile].value / 3)
          moveScores[tile].reason += "-Takeover"
        }
    
    // 6. Corners
        // If the piece is a corner there is a higher weight
        if (tile === 0 || tile === 2 || tile === 6 || tile === 8){
          moveScores[tile].score += weights.corners
          moveScores[tile].reason += "-Corners"
        }
  });
  
  // Find highest score
    const bestMove = moveScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    const sortedMoves = [...moveScores].sort((a, b) => b.score - a.score);

    console.log('Move Scores: ', sortedMoves);
    console.log('Best Move: ', bestMove);

//---------------------------------------------------------
  // Select the Bot piece to play
  for(let move of sortedMoves){
    // Reset piece scores for each move evaluation
    pieceScores = {
      1: 0,
      2: 0,
      3: 0
    };

    // What bot pieces can be played here?
    const pValue = board[move.index]?.value ?? 0;
    
    // Find all possible pieces that can be played
    // This is either everything if it is blank or 2/3 if opponent has ownership of tile
    const validPieceIndices = availablePieceIndices().filter(i => valuesMap[i] > pValue);
    const validPieceValues = validPieceIndices.map(i => valuesMap[i]);
    
    // Set invalid pieces to negative score
    if(!validPieceValues.includes(1)){pieceScores[1] = -10}
    if(!validPieceValues.includes(2)){pieceScores[2] = -10}
    if(!validPieceValues.includes(3)){pieceScores[3] = -10}

    // The actual move is going to depend on what the opponent has
    // 1. Don't use 3's first
    // 2. Prefer minimum when empty, minimum during takeover, and maximum when blocking, don't block with something less than opponent has
      // This is going to depend on the score - if the score is higher than 0.15 then go high

    // Find out if opponent has 3's left
    const opp3Count = [deadX[4], deadX[5]].filter(used => !used).length;
    const opp2Count = [deadX[2], deadX[3]].filter(used => !used).length;
    // How many 3's does bot have left
    const bot3Count = [deadO[4], deadO[5]].filter(used => !used).length;
    
    // Penalize using 3's when bot has fewer 3's than opponent (unless it's a winning move)
    // 3's are too important to be in a deficit with
    if(bot3Count < opp3Count && !move.reason.includes("Win")){
      pieceScores[3] += -.9;
    }

    // Determine if this is a blocking move
    const isBlockingMove = move.reason.includes("Block");
    
    // Piece selection based on move type and importance
    if (pValue === 0 && move.score < .15){
      // Low importance empty tiles - prefer minimum pieces
      pieceScores[1] += 1;
      pieceScores[2] += 0.5;
      pieceScores[3] += 0.1;
    } else if(pValue === 0 && move.score < .15 && bot3Count >= opp3Count){
      // Low importance but bot has 3's advantage - can use piece 2
      pieceScores[2] += (0.5 + (.15 - move.score));
    } else if(isBlockingMove && pValue === 0) {
      // Blocking move on empty square - CRITICAL: must use piece strong enough that opponent can't take it back
      // If opponent has 3's left, we MUST block with a 3
      if(opp3Count > 0) {
        // Opponent has 3's - must block with 3 or they'll just take it back
        pieceScores[3] += 1.5;
        pieceScores[2] += -0.8; // Heavily penalize using 2 when opponent has 3's
        pieceScores[1] += -1.0; // Very heavily penalize using 1
      } else if(opp2Count > 0) {
        // Opponent has 2's but no 3's - can block with 2 or 3
        pieceScores[3] += 0.8;
        pieceScores[2] += 1.2; // Prefer 2 to save the 3
        pieceScores[1] += -0.8; // Heavily penalize using 1
      } else {
        // Opponent only has 1's left - any piece works
        pieceScores[1] += 0.8;
        pieceScores[2] += 0.9;
        pieceScores[3] += 0.3;
      }
    } else if(isBlockingMove && pValue > 0) {
      // Blocking by overtaking opponent's piece - less critical since they already own it
      // Still consider opponent's pieces but with reduced weight
      if(opp3Count > 0 && pValue < 3) {
        // Opponent has 3's and we're taking over a 1 or 2 - prefer stronger pieces but not as critical
        pieceScores[3] += 0.8;
        pieceScores[2] += 0.4;
      } else {
        // Either opponent has no 3's or we're taking over a 3 - use minimum needed
        pieceScores[2] += 0.6;
        pieceScores[3] += 0.4;
      }
    } else if(move.score > .35) {
      // High importance moves (non-blocking) - favor stronger pieces
      pieceScores[2] += 0.25;
      pieceScores[3] += (0.5 + (move.score - .3));
    } else if(pValue > 0) {
      // Takeover situation - need to assess more carefully
      const opponentPieceValue = pValue;
      
      // Only consider pieces that can actually take over
      // Prefer using the minimum piece needed to take over
      if(validPieceValues.includes(2) && opponentPieceValue === 1) {
        // Can take over a 1 with a 2 - prefer this over using a 3
        pieceScores[2] += 0.8;
        pieceScores[3] += 0.3;
      } else if(validPieceValues.includes(3) && opponentPieceValue === 2) {
        // Need a 3 to take over a 2 - this is the only option
        pieceScores[3] += 0.9;
      } else if(opponentPieceValue === 1) {
        // Taking over a 1 - use smallest available
        pieceScores[1] += 1;
        pieceScores[2] += 0.6;
        pieceScores[3] += 0.2;
      }
    }

    const bestPieceValue = Object.keys(pieceScores).reduce((best, current) => 
    pieceScores[current] > pieceScores[best] ? current : best);

    const bestPiece = Number(bestPieceValue);
    const bestPieceScore = pieceScores[bestPiece];
    
    console.log(`Move ${move.index} evaluation:`, {
      pieceScores,
      bestPiece,
      bestPieceScore,
      validPieceValues
    });
    
    // Check if the best piece has a non-negative score AND is actually available
    if(bestPieceScore >= 0 && validPieceValues.includes(bestPiece)){
      // find index of bot's pieces which matches the bestpiece
      const chosenPieceIdx = validPieceIndices.find(i => valuesMap[i] === bestPiece);
      
      // Make sure we found a valid piece index
      if(chosenPieceIdx !== undefined) {
        // After finding bestMove and choosing piece
        return {
          moveIdx: move.index,
          pieceIdx: chosenPieceIdx,
          moveReason: 'hard-mode'
        };
      }
    }
  }
  
  // If we get here, no move was selected (shouldn't happen in normal gameplay)
  return {
    moveIdx: sortedMoves[0].index,
    pieceIdx: availablePieceIndices()[0],
    moveReason: 'hard-mode-fallback'
  };
  } 
