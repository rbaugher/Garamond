// Returns a valid placement index and O tile for the bot
// board: array of { value, type } for each tile
// usedO: array of booleans for O tiles
// deadO: array of booleans for O tiles
// difficulty: number (0=Easy, 1=Medium, 2=Hard)
// usedX: array of booleans for X tiles
// deadX: array of booleans for X tiles

//REWRITTEN WITHOUT AI

import { valuesMap, getAvailablePieceIndices, getAvailablePieceValues, getMaxAvailablePieceValue, getFirstAvailablePieceIndex } from '../pieceHelpers';

export function getBotMove(board, deadO, difficulty, deadX) {
  
  const VERBOSE = false; // set true for debugging move decisions
  const memo = new Map(); // simple transposition cache keyed by serialized state
  // Find all empty tiles on the board
  
  // Player Tiles
  const botPlayer = 'O';
  const opponent = botPlayer === 'O' ? 'X' : 'O';

  // Helpers mapped to this call-site's dead arrays
  const availablePieceIndices = () => getAvailablePieceIndices(deadO);
  const availablePieceValues = () => getAvailablePieceValues(deadO);
  const availableOpponentPieceIndices = () => getAvailablePieceIndices(deadX);
  const availableOpponentPieceValues = () => getAvailablePieceValues(deadX);

  // Winning Combinations
  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  // Find all possible moves for the bot
  // Available O tiles (values of unused, alive O tiles)
  const availablePieces = availablePieceValues();
  if (VERBOSE) console.log("AP: ", availablePieces);
  //Empty indices on the board
  const emptyIndices = board
    .map((tile, idx) => tile.value === null ? idx : null)
    .filter(idx => idx !== null);
  // Indices which are occupied by X (opponent) and less than max value remaining for O
  const takeoverIndices = board
    .map((tile, idx) => tile.player === opponent ? idx : null)
    .filter(tile => tile !== null)
    .filter(tile => availablePieces.length > 0 && board[tile].value < getMaxAvailablePieceValue(deadO))
  
  
  // Determine difficulty level being used
  // Easy Mode = Random valid move followed by blocking
  // Medium Mode = Win > Block > Setup > Center > Random
  // Hard Mode = Block > Win > Takeover > Fork > Block Fork > Opposite Corner > Setup > Corner > Center > Side > Random
  
  if (difficulty === 0 && deadO.filter(idx => idx === true).length < 1) {
    return getEasyMove(board);
  }
  if (difficulty === 1 || (difficulty === 0 && deadO.filter(idx => idx === true).length >= 1)) {
    return getMediumMove(board, deadO, deadX);
  }
  if (difficulty === 2) { return getHardMove(board, deadO, deadX); }

  // Available Moves
  function availableMoves() {
    const moves = emptyIndices.concat(takeoverIndices).sort((a, b) => a - b);
    return moves;
  }

  function getEasyMove(board){
    
    // Easy: random valid move
    const moves = availableMoves();
  const moveIdx = moves[Math.floor(Math.random() * moves.length)];
  // Determine which O tile to use (random from available)
  // Determine the value of the moveIdx tile currently on the board
  if (VERBOSE) console.log("moveIdx: ", moveIdx, "board[moveIdx]:", board[moveIdx]);
 
    if (board[moveIdx].value === null) {
      // Empty tile, pick a random available piece index
      const pieceIdxCandidates = availablePieceIndices();
      const pieceIdx = pieceIdxCandidates[Math.floor(Math.random() * pieceIdxCandidates.length)];
      return { moveIdx, pieceIdx, moveReason: 'random' };
    } else {
      // Takeover, pick a random available piece index that is strictly higher than the takeover value
      const takeoverValue = board[moveIdx].value;
      const pieceIdxCandidates = availablePieceIndices().filter(i => valuesMap[i] > takeoverValue);
      const pieceIdx = pieceIdxCandidates.length > 0
        ? pieceIdxCandidates[Math.floor(Math.random() * pieceIdxCandidates.length)]
        : availablePieceIndices()[0];
      return { moveIdx, pieceIdx, moveReason: 'random takeover' };
    }
  }

  function getMediumMove(board, deadO, deadX){
    // Medium: win > block > setup > center > Takeover > random
    const moves = availableMoves();
    let moveIdx, pieceIdx, moveReason = 'none';
  // 1. Win if possible
    const winIdx = findWinningMove(board, botPlayer);
    if (winIdx.idx !== null) {
      moveIdx = winIdx.idx;
      // pick the smallest available piece index whose value is > board[moveIdx].value
      const candidatePieceIndices = availablePieceIndices().filter(i => valuesMap[i] > (board[moveIdx].value || 0));
      if (candidatePieceIndices.length > 0) {
        const bestIdx = candidatePieceIndices.reduce((a,b) => valuesMap[a] < valuesMap[b] ? a : b);
        return { moveIdx, pieceIdx: bestIdx, moveReason: 'win' };
      }
    }
  if (VERBOSE) console.log("No Winning Move found")
  // 2. Block opponent win
    const blockObj = findBlockingMove(board, botPlayer);
    if (blockObj.moveIdx !== null) {
      return blockObj;
    }
    if (VERBOSE) console.log("No Blocking Move found")
  // 3. Setup two in a row
    const setupObj = findSetupMove(board, botPlayer);
    if (setupObj !== null) {
      if (VERBOSE) console.log("Setup Move found: ", setupObj)
      return setupObj;
    }
    if (VERBOSE) console.log("No Setup Move found")
  // 4. Takeover center if available
  if (board[4].player === opponent && availablePieces.length > 0 && board[4].value < getMaxAvailablePieceValue(deadO)) {
      moveIdx = 4;
      // pick the smallest available piece that overtakes center
      const candidatePieceIndices = availablePieceIndices().filter(i => valuesMap[i] > board[4].value);
      if (candidatePieceIndices.length > 0) {
        return { moveIdx, pieceIdx: candidatePieceIndices.reduce((a,b) => valuesMap[a] < valuesMap[b] ? a : b), moveReason: 'center takeover' };
      }
    }
  if (VERBOSE) console.log("No Center Takeover available")
  // 5. Takeover if player has a 2 with a 3
    const takeoverObj = findTakeoverMove(board, botPlayer);
    if (takeoverObj !== null) {
      return takeoverObj;
    }
    if (VERBOSE) console.log("No Takeover Move found")
  // 6. First Move
    if (deadO.every(v => v === deadO[0])){
  if (VERBOSE) console.log("WE ARE AT FIRST MOVE")
      //First Move!
      //Randomize which move to make, make it with a 1 - either one of the corners or the middle
  const openingMoves = [0,2,4,6,8]
      let randomIndex = 0
      do {
        randomIndex = Math.floor(Math.random()*openingMoves.length)
      }
      while (board[openingMoves[randomIndex]].value != null);
      
  // Use the smallest available piece index (prefer using a 1)
  const firstPieceIdx = availablePieceIndices().length > 0 ? availablePieceIndices()[0] : 0;
  return { moveIdx: openingMoves[randomIndex], pieceIdx: firstPieceIdx, moveReason: 'Opening Move'}
    }
  // 7. Get Easy Move
  if (VERBOSE) console.log("WE ARE AT EASY MOVE")
    return getEasyMove(board);
  }

  function getHardMove(board, deadO, deadX) {
    // Hard mode implementation
    return getMediumMove(board, deadO, deadX);
  }

  // Helper: find winning move for bot
  function findWinningMove(board, player) {
    let winningIdx = null;
    let winningCondition = null;

    for (let condition of winningConditions) {
      const [a, b, c] = condition;
      const line = [board[a], board[b], board[c]];
      const values = line.map(t => t.player);

      // Check if the player has 2 pieces in the line and the third is either empty or takeoverable
      if (
        values.filter(v => v === player).length === 2 &&
        (values.includes(null) || values.includes(player === 'O' ? 'X' : 'O'))
      ) {
  if (VERBOSE) console.log("Values in line for condition ", condition, ": ", values);

        // Find the empty index
        const emptyIdx = condition[values.indexOf(null)];

        // Check if the opponent can overtake the bot's piece
        const botBlockingIdx = condition.find(idx => board[idx].player === botPlayer);
          const opponentCanOvertake = botBlockingIdx !== undefined &&
          availableOpponentPieceValues().some(value => value > board[botBlockingIdx].value);

  if (VERBOSE) console.log("Empty Index: ", emptyIdx, " Bot Blocking Index: ", botBlockingIdx, " Opponent Can Overtake: ", opponentCanOvertake);

        if (emptyIdx !== undefined && emptyIndices.includes(emptyIdx)) {
          winningIdx = emptyIdx;
          winningCondition = condition;
        } else if (opponentCanOvertake) {
          winningIdx = botBlockingIdx;
          winningCondition = condition;
        }
      }
    }

    return { idx: winningIdx, condition: winningCondition };
  }
  
  // Helper: find blocking move for bot
  function findBlockingMove(board, player) {
    let blockMoveIdx = null;
    let blockPieceIdx = null;
    let reason = null;

  const opponent = player === 'O' ? 'X' : 'O';
  const opponentPieces = availableOpponentPieceValues();

    // Find the opponent's winning move
    const moveIdx = findWinningMove(board, opponent);
  if (moveIdx.idx !== null) {
  if (VERBOSE) console.log("Opponent's Winning Move Found: ", moveIdx);
      if (board[moveIdx.idx].value === null) {
          // Block by placing the highest-value piece that matches or exceeds the opponent's max piece
          const maxOpponentValue = getMaxAvailablePieceValue(deadX);
          const pieceValues = availablePieces.filter(i => i >= maxOpponentValue);

          if (pieceValues.length > 0) {
            blockMoveIdx = moveIdx.idx;
            // choose the smallest available piece value that is >= opponent's max
            const chosenValue = Math.min(...pieceValues);
            blockPieceIdx = availablePieceIndices().find(i => valuesMap[i] === chosenValue);
            reason = 'block';
          }
        }
      if (board[moveIdx.idx].player === botPlayer || board[moveIdx.idx].value === null) {
        // Player is trying to win by taking over our piece
        // Need to takeover one of their pieces to prevent win
        const takeoverable = moveIdx.condition.filter(
            i => board[i].player === opponent && board[i].value < getMaxAvailablePieceValue(deadO)
          );
          if (VERBOSE) console.log("Takeoverable Indices for Blocking: ", takeoverable);
          if (takeoverable.length > 0) {
                // Check if the winning move involves overtaking an opponent's piece
                  const mIdx = takeoverable[0]; // Pick the first takeoverable index
                  const possiblePieces = availablePieces.filter(i => i > board[mIdx].value);

                  if (possiblePieces.length > 0) {
                    blockMoveIdx = mIdx;
                    const chosenValue = Math.max(...possiblePieces);
                    blockPieceIdx = availablePieceIndices().find(i => valuesMap[i] === chosenValue);
                    reason = 'block takeover';
                  }
            } 
        }
      }
    return { moveIdx: blockMoveIdx, pieceIdx: blockPieceIdx, moveReason: reason };
  }

  // Helper: find move to get 2 in a row
  function findSetupMove(board, player) {
    for (let condition of winningConditions) {
      const [a, b, c] = condition;
      const line = [board[a], board[b], board[c]];
      const values = line.map(t => t.player);
      let conditionsMet = []
      // find which index satisfies the most conditions
        // Setup if bot has 1, opponent has none, and 2 empty
        if (values.filter(v => v === player).length === 1 && values.filter(v => v !== null && v !== player).length === 0) {
          // add current condition to array
          conditionsMet.push(a,b,c);
        }
        // Setup if bot has 1, opponent has 1 (less than max number that bot has), and 1 empty
        if (values.filter(v => v === player).length === 1 && values.filter(v => v === opponent).length === 1 && values.filter(v => v === null).length === 1) {
          // Is opponent's tile less than max available for bot?
          const opponentIdx = condition[values.indexOf(opponent)];
          if (board[opponentIdx].value < getMaxAvailablePieceValue(deadO)) {
            conditionsMet.push(a,b,c);
          }
        }
        // Setup if bot has 1, opponent has 2 (less than max number that bot has)
        if (values.filter(v => v === player).length === 1 && values.filter(v => v === opponent).length === 2) {
          const opponentIdxs = condition.filter(i => board[i].player === opponent);
          if (opponentIdxs.every(idx => board[idx].value < getMaxAvailablePieceValue(deadO))) {
            conditionsMet.push(a,b,c);
          }
        }
      // If any conditions met, pick the index that appears most often in conditionsMet
      if (conditionsMet.length > 0) {
        const freqMap = {};
        conditionsMet.forEach(idx => { freqMap[idx] = (freqMap[idx] || 0) + 1; });
        const sorted = Object.entries(freqMap).sort((a,b) => b[1] - a[1]);
        const targetIdx = parseInt(sorted[0][0]);
        // Check if targetIdx is in available moves (empty or takeover)
        const moves = availableMoves();
        if (moves.includes(targetIdx)) {
          const candidateVals = availablePieces.filter(v => v > (board[targetIdx].value || 0));
          // Empty, can use any available piece, Non-Empty, takeover
          if (emptyIndices.includes(targetIdx)) {
            if (candidateVals.length > 0) {
              const chosenVal = Math.min(...candidateVals);
              const pieceIdx = availablePieceIndices().find(i => valuesMap[i] === chosenVal);
              return { moveIdx: targetIdx, pieceIdx, moveReason: 'setup' };
            }
          }
          // If takeover then use max available piece that opponent has
          else if (takeoverIndices.includes(targetIdx)) {
            const maxOpponentValue = getMaxAvailablePieceValue(deadX);
            const candidateVals2 = availablePieces.filter(v => v >= maxOpponentValue && v > board[targetIdx].value);
            if (candidateVals2.length > 0) {
              const chosenVal = Math.min(...candidateVals2);
              const pieceIdx = availablePieceIndices().find(i => valuesMap[i] === chosenVal);
              return { moveIdx: targetIdx, pieceIdx, moveReason: 'setup takeover' };
            }
          }
        }
      }
    }
    return null;
  }

  // Find opponent tiles that can be taken (O has a strictly higher value available)
  // Improved: prefer takeovers that yield immediate tactical gain (create win/fork)
  function findTakeoverMove(board, player) {
    const candidateMoves = [];
    const moves = availableMoves();
    const corners = [0,2,6,8]
    for (let idx = 0; idx < board.length; idx++) {
      if (board[idx].player === opponent && board[idx].value !== null) {
        for (let pieceIdx of availablePieceIndices()) {
          const pieceValue = valuesMap[pieceIdx];
          if (pieceValue > board[idx].value) {
            // simulate takeover and check tactical value
            const simBoard = board.map((t, i) => i === idx ? { value: pieceValue, player: player } : { ...t });
            // if takeover creates immediate win, prefer it
            const winAfter = findWinningMove(simBoard, player);
            if (winAfter.idx !== null) {
              return { moveIdx: idx, pieceIdx: pieceIdx, moveReason: 'takeover win' };
            }
            const forkAfter = findForkMove(simBoard, player);
            // if takeover creates fork, prefer it
            if (forkAfter !== null) {
              return { moveIdx: idx, pieceIdx: pieceIdx, moveReason: 'takeover fork' };
            }
            // Find all possible takeovers and prefer 2 over 3
            if (!candidateMoves.includes(idx)) candidateMoves.push(idx);
          }
        }
      }
    }
    //All possible takeovers, prefer taking a 2 with a 3, otherwise... leave it
    for (let idx = 0; idx < candidateMoves.length; idx++) {
      // Are there any opponent 2's in the list
  if (moves.includes(idx) && board[idx].value === 2){
  const chosenVal = getMaxAvailablePieceValue(deadO);
        const pieceIdx = availablePieceIndices().find(i => valuesMap[i] === chosenVal);
        return { moveIdx: idx, pieceIdx, moveReason: 'takeover 2'}
      } /* else if (corners.includes(candidateMoves[idx] && moves.includes(idx))){
        return { moveIdx: idx, pieceIdx, moveReason: 'takeover corner'} */
      }
    return null;
  }

  // Helper: find fork move for bot
  function findForkMove(board, botType) {
    // Fork: a move that creates two lines with two bot tiles and one empty
    const forkIndices = [];
    for (let idx of emptyIndices) {
      let forkCount = 0;
      for (let condition of winningConditions) {
        if (condition.includes(idx)) {
          const line = condition.map(i => board[i]);
          const values = line.map(t => t.player);
          // If placing botType at idx would make two in a row and one empty
          if (values.filter(v => v === botType).length === 1 && values.filter(v => v === null).length === 2) {
            forkCount++;
          }
        }
      }
      if (forkCount >= 2) forkIndices.push(idx);
    }
    return forkIndices.length > 0 ? forkIndices[0] : null;
  }

  // Helper: block opponent's fork
  function findBlockForkMove(board, botType) {
    const opponent = botType === 'O' ? 'X' : 'O';
    const forkIndices = [];
    for (let idx of emptyIndices) {
      let forkCount = 0;
      for (let condition of winningConditions) {
        if (condition.includes(idx)) {
          const line = condition.map(i => board[i]);
          const values = line.map(t => t.player);
          if (values.filter(v => v === opponent).length === 1 && values.filter(v => v === null).length === 2) {
            forkCount++;
          }
        }
      }
      if (forkCount >= 2) forkIndices.push(idx);
    }
    return forkIndices.length > 0 ? forkIndices[0] : null;
  }

  // Helper: play opposite corner if opponent is in a corner
  function findOppositeCornerMove(board, botType) {
    const opponent = botType === 'O' ? 'X' : 'O';
    const corners = [0, 2, 6, 8];
    const opposite = { 0: 8, 2: 6, 6: 2, 8: 0 };
    for (let c of corners) {
      if (board[c].player === opponent && board[opposite[c]].value === null) {
        return opposite[c];
      }
    }
    return null;
  }

  // Helper: play empty side
  function findEmptySideMove(board) {
    const sides = [1, 3, 5, 7];
    for (let s of sides) {
      if (board[s].value === null) return s;
    }
    return null;
  }

  return { moveIdx: null, pieceIdx: null, moveReason: 'error' };
}
