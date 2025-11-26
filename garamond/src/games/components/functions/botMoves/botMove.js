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
    // Extra safety: filter out any positions occupied by bot
    return moves.filter(idx => board[idx].player !== botPlayer);
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
    // Hard mode: Strategic tile value management with deep position evaluation
    const moves = availableMoves();
    const corners = [0, 2, 6, 8];
    const sides = [1, 3, 5, 7];
    
    // Count remaining pieces by value
    const botPieceCounts = { 1: 0, 2: 0, 3: 0 };
    const oppPieceCounts = { 1: 0, 2: 0, 3: 0 };
    deadO.forEach((dead, idx) => { if (!dead) botPieceCounts[valuesMap[idx]]++; });
    deadX.forEach((dead, idx) => { if (!dead) oppPieceCounts[valuesMap[idx]]++; });
    
    if (VERBOSE) console.log("Bot pieces:", botPieceCounts, "Opp pieces:", oppPieceCounts);
    
    // Helper: Is this position strategically important?
    function getPositionValue(idx) {
      if (idx === 4) return 100; // Center is most valuable
      if (corners.includes(idx)) return 60; // Corners are very valuable
      return 20; // Sides are least valuable
    }
    
    // Helper: Can opponent overtake this position?
    function canOpponentOvertake(moveIdx, pieceValue) {
      const maxOppValue = Math.max(...Object.keys(oppPieceCounts).filter(v => oppPieceCounts[v] > 0).map(Number));
      return maxOppValue > pieceValue;
    }
    
    // Helper: Choose optimal piece for position (strategic piece selection)
    function choosePieceForPosition(moveIdx, currentValue = 0) {
      const validPieces = availablePieceIndices().filter(i => valuesMap[i] > currentValue);
      if (validPieces.length === 0) return null;
      
      const posValue = getPositionValue(moveIdx);
      const maxOppValue = Math.max(...Object.keys(oppPieceCounts).filter(v => oppPieceCounts[v] > 0).map(Number));
      
      // PRIORITY: Always try to use 1s first, then 2s, only use 3s when critical
      const ones = validPieces.filter(i => valuesMap[i] === 1);
      const twos = validPieces.filter(i => valuesMap[i] === 2);
      const threes = validPieces.filter(i => valuesMap[i] === 3);
      
      // For sides: ALWAYS use 1 if available
      if (posValue <= 20 && ones.length > 0) {
        return ones[0];
      }
      
      // For corners and center: use smallest piece that won't be immediately overtaken
      if (posValue >= 60) {
        // If opponent has 3s and we're on center/corner, use a 2 if available
        if (oppPieceCounts[3] > 0 && twos.length > 0) {
          return twos[0];
        }
        // If opponent only has 2s or less, use a 1
        if (maxOppValue <= 2 && ones.length > 0) {
          return ones[0];
        }
        // If opponent only has 1s, use a 1
        if (maxOppValue <= 1 && ones.length > 0) {
          return ones[0];
        }
      }
      
      // Default: use smallest valid piece
      if (ones.length > 0) return ones[0];
      if (twos.length > 0) return twos[0];
      if (threes.length > 0) return threes[0];
      
      return validPieces[0];
    }
    
    // Helper: Comprehensive move evaluation
    function evaluateMove(moveIdx, pieceIdx) {
      const pieceValue = valuesMap[pieceIdx];
      const simBoard = board.map((t, i) => 
        i === moveIdx ? { value: pieceValue, player: botPlayer } : { ...t }
      );
      
      let score = 0;
      
      // WINNING MOVE - highest priority
      const winAfter = findWinningMove(simBoard, botPlayer);
      if (winAfter.idx !== null) {
        score += 10000;
        // Use smallest piece that wins
        score += (4 - pieceValue) * 100;
        return score;
      }
      
      // Count threats created (positions with 2 bot pieces and 1 empty)
      let threats = 0;
      let secureThreats = 0; // Threats opponent can't easily break
      for (let condition of winningConditions) {
        if (condition.includes(moveIdx)) {
          const line = condition.map(i => simBoard[i]);
          const values = line.map(t => t.player);
          if (values.filter(v => v === botPlayer).length === 2 && 
              values.filter(v => v === null).length === 1) {
            threats++;
            // Check if all pieces in line are secure (3s or 2s when opp has no 3s)
            const botPiecesInLine = condition.filter(i => simBoard[i].player === botPlayer);
            const allSecure = botPiecesInLine.every(i => 
              simBoard[i].value === 3 || (simBoard[i].value === 2 && oppPieceCounts[3] === 0)
            );
            if (allSecure) secureThreats++;
          }
        }
      }
      score += threats * 300;
      score += secureThreats * 200;
      
      // Position value bonus
      score += getPositionValue(moveIdx);
      
      // Security bonus: can opponent overtake?
      if (!canOpponentOvertake(moveIdx, pieceValue)) {
        score += 150;
      }
      
      // Piece economy: HEAVILY penalize using 3s unless absolutely critical
      if (pieceValue === 3) {
        // Massive penalty for using 3 on sides
        if (getPositionValue(moveIdx) <= 20) {
          score -= 500;
        }
        // Large penalty for using 3 on corners unless opponent has 3s
        else if (getPositionValue(moveIdx) < 100 && oppPieceCounts[3] === 0) {
          score -= 300;
        }
        // Moderate penalty for using 3 even on center if opponent doesn't have 3s
        else if (oppPieceCounts[3] === 0) {
          score -= 200;
        }
      }
      
      // Prefer using 1s (bonus for piece economy)
      if (pieceValue === 1) {
        score += 100;
      }
      // Slightly prefer 2s over 3s
      else if (pieceValue === 2) {
        score += 50;
      }
      
      // Bonus for taking over opponent pieces
      if (board[moveIdx].player === opponent) {
        score += 50;
        // Extra bonus for taking over strategic positions
        score += getPositionValue(moveIdx) * 0.5;
      }
      
      // Check if this blocks opponent's threats
      let blockedThreats = 0;
      for (let condition of winningConditions) {
        if (condition.includes(moveIdx)) {
          const line = condition.map(i => board[i]);
          const values = line.map(t => t.player);
          if (values.filter(v => v === opponent).length === 2) {
            blockedThreats++;
          }
        }
      }
      score += blockedThreats * 250;
      
      return score;
    }
    
    // Track if player has used any 3s yet
    const playerUsed3s = deadX.filter((dead, idx) => dead && valuesMap[idx] === 3).length;
    const botUsed3s = deadO.filter((dead, idx) => dead && valuesMap[idx] === 3).length;
    
    // 0. First move - NEVER use 3, prefer 1
    const totalPiecesUsed = deadO.filter(Boolean).length + deadX.filter(Boolean).length;
    if (totalPiecesUsed === 0) {
      // Opening move - use a 1 on center or corner
      const openingMoves = [4, 0, 2, 6, 8]; // Prefer center, then corners
      for (let idx of openingMoves) {
        if (board[idx].value === null) {
          const ones = availablePieceIndices().filter(i => valuesMap[i] === 1);
          if (ones.length > 0) {
            if (VERBOSE) console.log("Opening move with 1");
            return { moveIdx: idx, pieceIdx: ones[0], moveReason: 'opening with 1' };
          }
        }
      }
    }
    
    // Helper: Filter out 3s unless conditions are met for using them
    function getAvailableNon3Pieces() {
      return availablePieceIndices().filter(i => valuesMap[i] !== 3);
    }
    
    // Helper: Can we use a 3?
    function canUse3() {
      // Never use both 3s before player uses any
      if (playerUsed3s === 0 && botUsed3s >= 1) return false;
      
      // Only use 3 if player has used at least one 3, OR we're in endgame (5+ pieces used each)
      const botPiecesUsed = deadO.filter(Boolean).length;
      const playerPiecesUsed = deadX.filter(Boolean).length;
      
      return playerUsed3s > 0 || (botPiecesUsed >= 5 && playerPiecesUsed >= 5);
    }
    
    // 1. ALWAYS check for immediate win
    const winIdx = findWinningMove(board, botPlayer);
    if (winIdx.idx !== null) {
      let candidatePieces = availablePieceIndices().filter(i => valuesMap[i] > (board[winIdx.idx].value || 0));
      
      // Filter out 3s if we shouldn't use them yet (unless it's the only way to win)
      if (!canUse3()) {
        const non3Pieces = candidatePieces.filter(i => valuesMap[i] !== 3);
        if (non3Pieces.length > 0) {
          candidatePieces = non3Pieces;
        }
      }
      
      if (candidatePieces.length > 0) {
        // Use smallest piece that wins
        const bestIdx = candidatePieces.reduce((a,b) => valuesMap[a] < valuesMap[b] ? a : b);
        return { moveIdx: winIdx.idx, pieceIdx: bestIdx, moveReason: 'win' };
      }
    }
    if (VERBOSE) console.log("No immediate win");

    // 2. ALWAYS block opponent win
    const blockObj = findBlockingMove(board, botPlayer);
    if (blockObj.moveIdx !== null) {
      if (VERBOSE) console.log("Blocking opponent win at", blockObj.moveIdx);
      return blockObj;
    }
    if (VERBOSE) console.log("No block needed");

    // 3. Look for moves that create two threats (fork)
    for (let moveIdx of moves) {
      // Get all valid pieces for this move
      let validPieces = availablePieceIndices().filter(i => 
        valuesMap[i] > (board[moveIdx].value || 0)
      );
      
      // Filter out 3s unless we're allowed to use them
      if (!canUse3()) {
        const non3Pieces = validPieces.filter(i => valuesMap[i] !== 3);
        if (non3Pieces.length > 0) {
          validPieces = non3Pieces;
        }
      }
      
      for (let pieceIdx of validPieces) {
        const score = evaluateMove(moveIdx, pieceIdx);
        // If this creates multiple threats (score > 800), it's a fork
        if (score >= 800) {
          if (VERBOSE) console.log("Fork opportunity at", moveIdx, "with score", score);
          return { moveIdx, pieceIdx, moveReason: 'fork' };
        }
      }
    }
    if (VERBOSE) console.log("No fork found");

    // 4. Check if opponent is about to create two threats - block it
    for (let condition of winningConditions) {
      const [a, b, c] = condition;
      const line = [board[a], board[b], board[c]];
      const values = line.map(t => t.player);
      
      // Opponent has 1 piece and 2 empty = potential fork setup
      if (values.filter(v => v === opponent).length === 1 && 
          values.filter(v => v === null).length === 2) {
        // Block with a secure piece
        for (let idx of [a, b, c]) {
          if (board[idx].value === null && moves.includes(idx)) {
            let validPieces = availablePieceIndices().filter(i => 
              valuesMap[i] > (board[idx].value || 0)
            );
            
            // Filter out 3s unless allowed
            if (!canUse3()) {
              const non3Pieces = validPieces.filter(i => valuesMap[i] !== 3);
              if (non3Pieces.length > 0) {
                validPieces = non3Pieces;
              }
            }
            
            if (validPieces.length > 0) {
              const pieceIdx = choosePieceForPosition(idx) || validPieces[0];
              if (VERBOSE) console.log("Blocking opponent setup at", idx);
              return { moveIdx: idx, pieceIdx, moveReason: 'block setup' };
            }
          }
        }
      }
    }
    if (VERBOSE) console.log("No opponent setup to block");

    // 5. Use 3s to takeover ONLY when it creates immediate winning threat or blocks opponent
    const threes = availablePieceIndices().filter(i => valuesMap[i] === 3);
    if (threes.length > 0 && oppPieceCounts[3] > 0) {
      // ONLY use 3 if opponent also has 3s AND it's on center with 2+ threats
      if (board[4].player === opponent && board[4].value === 2 && moves.includes(4)) {
        const pieceIdx = threes[0];
        const score = evaluateMove(4, pieceIdx);
        // Only if this creates multiple threats (score > 600)
        if (score > 600) {
          if (VERBOSE) console.log("Critical 3-takeover of center");
          return { moveIdx: 4, pieceIdx, moveReason: 'critical 3 takeover' };
        }
      }
    }
    if (VERBOSE) console.log("No critical 3-takeover needed");

    // 6. Evaluate ALL possible moves and choose the absolute best
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let moveIdx of moves) {
      // Get all valid pieces for this position
      let validPieces = availablePieceIndices().filter(i => 
        valuesMap[i] > (board[moveIdx].value || 0)
      );
      
      // Filter out 3s unless allowed
      if (!canUse3()) {
        const non3Pieces = validPieces.filter(i => valuesMap[i] !== 3);
        if (non3Pieces.length > 0) {
          validPieces = non3Pieces;
        }
      }
      
      // Try each valid piece and evaluate
      for (let pieceIdx of validPieces) {
        const score = evaluateMove(moveIdx, pieceIdx);
        if (score > bestScore) {
          bestScore = score;
          bestMove = { moveIdx, pieceIdx, moveReason: `best (score: ${score})` };
        }
      }
    }
    
    if (bestMove !== null) {
      if (VERBOSE) console.log("Best move:", bestMove, "with score", bestScore);
      return bestMove;
    }

    // 7. Ultimate fallback - ensure we always return a valid move
    if (VERBOSE) console.log("Fallback to random");
    const fallback = getEasyMove(board);
    
    // Extra safety check: if fallback is still invalid, find ANY valid move
    if (fallback.moveIdx === null || fallback.pieceIdx === null) {
      if (VERBOSE) console.log("Emergency fallback - finding ANY valid move");
      for (let moveIdx of moves) {
        const validPieces = availablePieceIndices().filter(i => 
          valuesMap[i] > (board[moveIdx].value || 0)
        );
        if (validPieces.length > 0) {
          return { moveIdx, pieceIdx: validPieces[0], moveReason: 'emergency fallback' };
        }
      }
    }
    
    return fallback;
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
