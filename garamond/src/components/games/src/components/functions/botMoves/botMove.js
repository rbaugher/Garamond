// Returns a valid placement index and O tile for the bot
// board: array of { value, type } for each tile
// usedO: array of booleans for O tiles
// deadO: array of booleans for O tiles
// difficulty: number (0=Easy, 1=Medium, 2=Hard)
// usedX: array of booleans for X tiles
// deadX: array of booleans for X tiles

//REWRITTEN WITHOUT AI

export function getBotMove(board, deadO, difficulty, deadX) {
  
  const VERBOSE = false; // set true for debugging move decisions
  const memo = new Map(); // simple transposition cache keyed by serialized state
  // Find all empty tiles on the board
  
  // Player Tiles
  const valuesMap = [1,1,2,2,3,3];
  //This has to be an updated value, can't be static
  const UpdatingValuesMap = valuesMap.map((tile, idx) => deadO[idx] === false ? tile: null)
  const botPlayer = 'O';
  const opponent = botPlayer === 'O' ? 'X' : 'O';

  // Helper: get opponent's remaining tile values
  function getOpponentPieceValues() {
    return valuesMap.filter((v, idx) => !deadX[idx]);
  }

  // Winning Combinations
  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  // Find all possible moves for the bot
  // Available O tiles (indices of unused, alive O tiles)
  const availablePieces = valuesMap.filter((v, i) => !deadO[i]);
  console.log("AP: ",availablePieces)
  //Empty indices on the board
  const emptyIndices = board
    .map((tile, idx) => tile.value === null ? idx : null)
    .filter(idx => idx !== null);
  // Indices which are occupied by X (opponent) and less than max value remaining for O
  const takeoverIndices = board
    .map((tile, idx) => tile.player === opponent ? idx : null)
    .filter(tile => tile !== null)
    .filter(tile => board[tile].value < Math.max(...availablePieces))
  
  
  // Determine difficulty level being used
  // Easy Mode = Random valid move followed by blocking
  // Medium Mode = Win > Block > Setup > Center > Random
  // Hard Mode = Block > Win > Takeover > Fork > Block Fork > Opposite Corner > Setup > Corner > Center > Side > Random
  
  if (difficulty === 0 && deadO.filter(idx => idx === true).length < 1) { 
    return getEasyMove(board); }
  if (difficulty === 1 || difficulty === 0 && deadO.filter(idx => idx === true).length >= 1) { return getMediumMove(board, deadO, deadX); }
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
    console.log("moveIdx: ", moveIdx)
    console.log("Board: ", board)
    console.log("board[moveIdx]: ", board[moveIdx])
 
    if (board[moveIdx].value === null) {
      // Empty tile, can use any available O tile
      console.log("UpdatingValuesMap: ", UpdatingValuesMap)
      let pieceIdx;
      do {
        pieceIdx = UpdatingValuesMap[Math.floor(Math.random() * UpdatingValuesMap.length)];
      } while (pieceIdx === null);
      console.log("EASY MODE: RANDOM")

      return { moveIdx, pieceIdx: UpdatingValuesMap.indexOf(pieceIdx), moveReason: 'random' };
    }
    else {
      // Takeover, must use strictly higher O tile
      const takeoverValue = board[moveIdx].value;
      let pieceIdx;
      do {
        pieceIdx = UpdatingValuesMap[Math.floor(Math.random() * UpdatingValuesMap.length)];
      } while (pieceIdx === null);
      console.log("EASY MODE: TAKEOVER")
      return { moveIdx, pieceIdx: UpdatingValuesMap.indexOf(pieceIdx), moveReason: 'random takeover' };
    }
  }

  function getMediumMove(board, deadO, deadX){
    // Medium: win > block > setup > center > Takeover > random
    const moves = availableMoves();
    let moveIdx, pieceIdx, moveReason = 'none';
  // 1. Win if possible
    const winIdx = findWinningMove(board, botPlayer);
    if (winIdx.idx !== null) {
      console.log("Winning Condition found for bot: ", winIdx.condition)
      moveIdx = winIdx.idx;
      // pick the smallest available tile that still wins (prefer to win with low-cost if possible)
      const pieceIdx = availablePieces.filter(i => i > board[moveIdx].value)
      if (pieceIdx.length > 0) {
        console.log("UpdatingValuesMap: ", UpdatingValuesMap)
        return { moveIdx, pieceIdx: UpdatingValuesMap.indexOf(Math.min(...pieceIdx)), moveReason: 'win' };
      }
    }
    console.log("No Winning Move found")
  // 2. Block opponent win
    const blockObj = findBlockingMove(board, botPlayer);
    if (blockObj.moveIdx !== null) {
      console.log("We are blocking - blockObj: ", blockObj)
      return blockObj;
    } 
    console.log("No Blocking Move found")
  // 3. Setup two in a row
    const setupObj = findSetupMove(board, botPlayer);
    if (setupObj !== null) {
      console.log("Setup Move found: ", setupObj)
      return setupObj;
    }
    console.log("No Setup Move found")
  // 4. Takeover center if available
    if (board[4].player === opponent && board[4].value < Math.max(...availablePieces)) {
      moveIdx = 4;
      pieceIdx = UpdatingValuesMap.indexOf(board[4].value+1);
      return { moveIdx, pieceIdx: pieceIdx, moveReason: 'center takeover' };
      }
    console.log("No Center Takeover available")
  // 5. Takeover if player has a 2 with a 3
    const takeoverObj = findTakeoverMove(board, botPlayer);
    if (takeoverObj !== null) {
      console.log("Takeover Move found: ", takeoverObj)
      return takeoverObj;
    }  
    console.log("No Takeover Move found")
  // 6. First Move
    if (deadO.every(v => v === deadO[0])){
      console.log("WE ARE AT FIRST MOVE")
      //First Move!
      //Randomize which move to make, make it with a 1 - either one of the corners or the middle
      const openingMoves = [0,2,4,6,8]
      let randomIndex = 0
      do {
        randomIndex = Math.floor(Math.random()*openingMoves.length)
      }
      while (board[openingMoves[randomIndex]].value != null);
      
      return { moveIdx: openingMoves[randomIndex], pieceIdx: 0, moveReason: 'Opening Move'}
    }
  // 7. Get Easy Move
    console.log("WE ARE AT EASY MOVE")
    return getEasyMove(board);
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
        console.log("Values in line for condition ", condition, ": ", values);

        // Find the empty index
        const emptyIdx = condition[values.indexOf(null)];

        // Check if the opponent can overtake the bot's piece
        const botBlockingIdx = condition.find(idx => board[idx].player === botPlayer);
        const opponentCanOvertake = botBlockingIdx !== undefined &&
          getOpponentPieceValues().some(value => value > board[botBlockingIdx].value);

        console.log("Empty Index: ", emptyIdx, " Bot Blocking Index: ", botBlockingIdx, " Opponent Can Overtake: ", opponentCanOvertake);

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
    const opponentPieces = getOpponentPieceValues();

    // Find the opponent's winning move
    const moveIdx = findWinningMove(board, opponent);
    if (moveIdx.idx !== null) {
      console.log("Opponent's Winning Move Found: ", moveIdx);
      if (board[moveIdx.idx].value === null) {
          // Block by placing the highest-value piece that matches or exceeds the opponent's max piece
          const maxOpponentValue = Math.max(...opponentPieces);
          const pieceValues = availablePieces.filter(i => i >= maxOpponentValue);

          if (pieceValues.length > 0) {
            blockMoveIdx = moveIdx.idx;
            console.log("UpdatingValuesMap: ", UpdatingValuesMap)
            blockPieceIdx = UpdatingValuesMap.indexOf(pieceValues[0]);
            reason = 'block';
          } else {
            console.log("Cannot block - no piece can match opponent's winning move");
          }
        }
      if (board[moveIdx.idx].player === botPlayer || board[moveIdx.idx].value === null) {
        // Player is trying to win by taking over our piece
        // Need to takeover one of their pieces to prevent win
        const takeoverable = moveIdx.condition.filter(
            i => board[i].player === opponent && board[i].value < Math.max(...availablePieces)
          );
          console.log("Takeoverable Indices for Blocking: ", takeoverable);
          if (takeoverable.length > 0) {
                // Check if the winning move involves overtaking an opponent's piece
                  const mIdx = takeoverable[0]; // Pick the first takeoverable index
                  const possiblePieces = availablePieces.filter(i => i > board[mIdx].value);

                  if (possiblePieces.length > 0) {
                    blockMoveIdx = mIdx;
                    console.log("UpdatingValuesMap: ", UpdatingValuesMap)
                    blockPieceIdx = UpdatingValuesMap.indexOf(Math.max(...possiblePieces));
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
          if (board[opponentIdx].value < Math.max(...availablePieces)) {
            conditionsMet.push(a,b,c);
          }
        }
        // Setup if bot has 1, opponent has 2 (less than max number that bot has)
        if (values.filter(v => v === player).length === 1 && values.filter(v => v === opponent).length === 2) {
          const opponentIdxs = condition.filter(i => board[i].player === opponent);
          if (opponentIdxs.every(idx => board[idx].value < Math.max(...availablePieces))) {
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
          const pieceIdx = availablePieces.filter(i => i > board[targetIdx].value);
          // Empty, can use any available piece, Non-Empty, takeover
          if (emptyIndices.includes(targetIdx)) {
            return { moveIdx: targetIdx, pieceIdx: Math.min(...pieceIdx), moveReason: 'setup' };
          } 
          // If takeover then use max available piece that opponent has
          else if (takeoverIndices.includes(targetIdx)) {
            const maxOpponentValue = Math.max(...getOpponentPieceValues());
            const pieceIdx = availablePieces.filter(i => i >= maxOpponentValue && i > board[targetIdx].value);
            if (pieceIdx.length > 0) {
              return { moveIdx: targetIdx, pieceIdx: Math.min(...pieceIdx), moveReason: 'setup takeover' };
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
        for (let piece of availablePieces) {
          const pieceValue = valuesMap[piece];
          if (pieceValue > board[idx].value) {
            // simulate takeover and check tactical value
            const simBoard = board.map((t, i) => i === idx ? { value: pieceValue, type: player } : { ...t });
            // if takeover creates immediate win, prefer it
            const winAfter = findWinningMove(simBoard, player);
            if (winAfter.idx !== null) {
              return { moveIdx: idx, pieceIdx: piece, moveReason: 'takeover win' };
            }
            const forkAfter = findForkMove(simBoard, player);
            // if takeover creates fork, prefer it
            if (forkAfter !== null) {
              return { moveIdx: idx, pieceIdx: piece, moveReason: 'takeover fork' };
            }
            // Find all possible takeovers and prefer 2 over 3
            candidateMoves.push(idx)
          }
        }
      }
    }
    //All possible takeovers, prefer taking a 2 with a 3, otherwise... leave it
    for (let idx = 0; idx < candidateMoves.length; idx++) {
      // Are there any opponent 2's in the list
      if (moves.includes(idx) && board[idx].value === 2){
        return { moveIdx: idx, pieceIdx: Math.max(...availablePieces), moveReason: 'takeover 2'}
      } /* else if (corners.includes(candidateMoves[idx] && moves.includes(idx))){
        return { moveIdx: idx, pieceIdx: Math.max(...availablePieces), moveReason: 'takeover corner'} */
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
          const values = line.map(t => t.type);
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
          const values = line.map(t => t.type);
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
      if (board[c].type === opponent && board[opposite[c]].value === null) {
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

  // --- Minimax support (shallow search) ---
  // Evaluate board heuristic for minimax: positive = good for bot (O), negative = good for opponent (X)
  function evaluateBoard(board, usedO_local, deadO_local, usedX_local, deadX_local) {
    // Simple heuristic: +100 for bot win, -100 for opponent win
    // +10 for each two-in-a-row (with empty) for bot, -10 for opponent
    // small bonus for remaining higher tiles for bot
    const botType = 'O';
    const oppType = 'X';
    const valuesMap = [1,1,2,2,3,3];
    // Check win
    const checkWin = (type) => {
      for (let condition of winningConditions) {
        const [a,b,c] = condition;
        if (board[a].type === type && board[b].type === type && board[c].type === type) return true;
      }
      return false;
    };
    if (checkWin(botType)) return 100;
    if (checkWin(oppType)) return -100;

    let score = 0;
    for (let condition of winningConditions) {
      const line = condition.map(i => board[i]);
      const types = line.map(t => t.type);
      if (types.filter(t => t === botType).length === 2 && types.includes(null)) score += 10;
      if (types.filter(t => t === oppType).length === 2 && types.includes(null)) score -= 10;
    }
    // remaining tile value heuristic
    const remainingBot = availableO.map(i => valuesMap[i]).reduce((a,b) => a+b, 0);
    const remainingOpp = getOpponentTileValues().reduce((a,b) => a+b, 0);
    score += (remainingBot - remainingOpp) * 0.5;
    return score;
  }

  // Generate possible moves for a player: returns array of { moveIdx, tileIdx, tileValue, nextUsedO, nextDeadO, nextUsedX, nextDeadX }
  function generateMoves(boardState, playerType, usedO_local, deadO_local, usedX_local, deadX_local) {
    const moves = [];
    const emptyIdxs = boardState.map((t,i) => t.value === null ? i : null).filter(i => i !== null);
    const valuesMap = [1,1,2,2,3,3];
    if (playerType === 'O') {
      const avail = usedO_local.map((u,i) => !u && !deadO_local[i] ? i : null).filter(i => i !== null);
      for (let mi of emptyIdxs) {
        for (let ti of avail) {
          const nextUsedO = usedO_local.slice();
          nextUsedO[ti] = true;
          moves.push({ moveIdx: mi, tileIdx: ti, tileValue: valuesMap[ti], nextUsedO, nextDeadO: deadO_local.slice(), nextUsedX: usedX_local.slice(), nextDeadX: deadX_local.slice() });
        }
      }
    } else {
      const avail = usedX_local.map((u,i) => !u && !deadX_local[i] ? i : null).filter(i => i !== null);
      for (let mi of emptyIdxs) {
        for (let ti of avail) {
          const nextUsedX = usedX_local.slice();
          nextUsedX[ti] = true;
          moves.push({ moveIdx: mi, tileIdx: ti, tileValue: valuesMap[ti], nextUsedO: usedO_local.slice(), nextDeadO: deadO_local.slice(), nextUsedX, nextDeadX: deadX_local.slice() });
        }
      }
    }
    return moves;
  }

  // Apply a move to a board copy
  function applyMove(boardState, move, playerType) {
    const newBoard = boardState.map(t => ({ ...t }));
    newBoard[move.moveIdx] = { value: move.tileValue, type: playerType };
    return newBoard;
  }

}






  /* // Minimax (depth-limited, no alpha-beta for simplicity)
  function minimax(boardState, depth, maximizingPlayer, usedO_local, deadO_local, usedX_local, deadX_local) {
    if (depth === 0) return evaluateBoard(boardState, usedO_local, deadO_local, usedX_local, deadX_local);
    const playerType = maximizingPlayer ? 'O' : 'X';
    const moves = generateMoves(boardState, playerType, usedO_local, deadO_local, usedX_local, deadX_local);
    if (moves.length === 0) return evaluateBoard(boardState, usedO_local, deadO_local, usedX_local, deadX_local);
    if (maximizingPlayer) {
      let best = -Infinity;
      for (let m of moves) {
        const nextBoard = applyMove(boardState, m, 'O');
        const val = minimax(nextBoard, depth-1, false, m.nextUsedO, m.nextDeadO, m.nextUsedX, m.nextDeadX);
        best = Math.max(best, val);
      }
      return best;
    } else {
      let best = Infinity;
      for (let m of moves) {
        const nextBoard = applyMove(boardState, m, 'X');
        const val = minimax(nextBoard, depth-1, true, m.nextUsedO, m.nextDeadO, m.nextUsedX, m.nextDeadX);
        best = Math.min(best, val);
      }
      return best;
    }

  let moveIdx, oTileIdx;
  let moveReason = 'none';

  if (difficulty === 0) {
    moveIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    oTileIdx = availableO[Math.floor(Math.random() * availableO.length)];
  } else {
    // Medium: win, block, setup, center, first available
    // Hard: block, win, fork, block fork, opposite corner, setup, corners, center, side, first available
    const winIdx = findWinningMove(board, 'O');
    const blockObj = findBlockingMove(board, 'O');
    const setupIdx = findSetupMove(board, 'O');
    if (difficulty === 2) {
      // Hard: block, win, takeover, fork, block fork, opposite corner, setup, corners, center, side, first available
      if (blockObj !== null) {
        moveIdx = blockObj.blockIdx;
        oTileIdx = blockObj.botTileIdx;
        moveReason = 'block';
      } else if (winIdx !== null) {
        moveIdx = winIdx;
        // pick the smallest available tile that still wins (prefer to win with low-cost if possible)
        const valuesMap = [1,1,2,2,3,3];
        const sortedAvail = availableO.slice().sort((a,b) => valuesMap[a]-valuesMap[b]);
        oTileIdx = sortedAvail[0];
        moveReason = 'win';
      } else {
        // Takeover: take opponent's maintile with higher value
        const takeover = findTakeoverMove(board, 'O');
        if (takeover) {
          moveIdx = takeover.moveIdx;
          oTileIdx = takeover.oTileIdx;
          moveReason = 'takeover';
        } else {
          const forkIdx = findForkMove(board, 'O');
          if (forkIdx !== null) {
            moveIdx = forkIdx;
            // use smallest tile that still creates the fork (cheapest effective tile)
            const valuesMap = [1,1,2,2,3,3];
            const sortedAvail = availableO.slice().sort((a,b) => valuesMap[a]-valuesMap[b]);
            oTileIdx = sortedAvail[0];
          } else {
            const blockForkIdx = findBlockForkMove(board, 'O');
            if (blockForkIdx !== null) {
              moveIdx = blockForkIdx;
              const valuesMap = [1,1,2,2,3,3];
              const sortedAvail = availableO.slice().sort((a,b) => valuesMap[a]-valuesMap[b]);
              oTileIdx = sortedAvail[0];
              moveReason = 'block-fork';
            } else {
              const oppCornerIdx = findOppositeCornerMove(board, 'O');
              if (oppCornerIdx !== null) {
                moveIdx = oppCornerIdx;
                oTileIdx = availableO[0];
                moveReason = 'opp-corner';
              } else if (setupIdx !== null) {
                moveIdx = setupIdx;
                const setupMinValue = Math.min(...availableO.map(idx => [1,1,2,2,3,3][idx]));
                oTileIdx = availableO.find(idx => [1,1,2,2,3,3][idx] === setupMinValue);
                moveReason = 'setup';
              } else {
                const corners = [0, 2, 6, 8].filter(idx => emptyIndices.includes(idx));
                if (corners.length > 0) {
                  moveIdx = corners[0];
                  moveReason = 'corner';
                } else if (emptyIndices.includes(4)) {
                  moveIdx = 4;
                  moveReason = 'center';
                } else {
                  const sideIdx = findEmptySideMove(board);
                  if (sideIdx !== null) {
                    moveIdx = sideIdx;
                    moveReason = 'side';
                  } else {
                    moveIdx = emptyIndices[0];
                    moveReason = 'fallback';
                  }
                }
                const values = availableO.map(idx => [1,1,2,2,3,3][idx]).sort((a,b) => a-b);
                const medianValue = values[Math.floor(values.length/2)];
                oTileIdx = availableO.find(idx => [1,1,2,2,3,3][idx] === medianValue);
              }
            }
          }
          // If heuristics still didn't pick a tile for some reason, fallback to minimax to choose best move+tile
          if (moveIdx === undefined || oTileIdx === undefined) {
            const depth = 3; // shallow search
            let bestScore = -Infinity;
            let bestChoice = null;
            const valuesMap = [1,1,2,2,3,3];
            // enumerate all legal move+tile combos for O
            for (let mi of emptyIndices) {
              for (let ti of availableO) {
                const candidate = { moveIdx: mi, tileIdx: ti, tileValue: valuesMap[ti] };
                const simBoard = applyMove(board, candidate, 'O');
                const score = minimax(simBoard, depth-1, false, usedO, deadO, usedX, deadX);
                if (score > bestScore) {
                  bestScore = score;
                  bestChoice = candidate;
                }
              }
            }
            if (bestChoice) {
              moveIdx = bestChoice.moveIdx;
              oTileIdx = bestChoice.tileIdx;
              moveReason = 'minimax';
            } else {
              // safe fallback
              moveIdx = emptyIndices[0];
              oTileIdx = availableO[0];
              moveReason = 'fallback';
            }
          }
        }
      } else {
        // Medium: win first, then block
        if (winIdx !== null) {
          moveIdx = winIdx;
          oTileIdx = availableO.slice().sort((a,b) => [1,1,2,2,3,3][a]-[1,1,2,2,3,3][b])[0];
        } else if (blockObj !== null) {
          moveIdx = blockObj.blockIdx;
          oTileIdx = blockObj.botTileIdx;
        } else if (setupIdx !== null) {
          moveIdx = setupIdx;
          oTileIdx = availableO.slice().sort((a,b) => [1,1,2,2,3,3][a]-[1,1,2,2,3,3][b])[0];
        } else if (emptyIndices.includes(4)) {
          moveIdx = 4;
          oTileIdx = availableO.slice().sort((a,b) => [1,1,2,2,3,3][a]-[1,1,2,2,3,3][b])[0];
        } else {
          moveIdx = emptyIndices[0];
          oTileIdx = availableO.slice().sort((a,b) => [1,1,2,2,3,3][a]-[1,1,2,2,3,3][b])[0];
        }
      }
    }
  }

  const oTileValue = [1,1,2,2,3,3][oTileIdx];
  return { moveIdx, oTileIdx, oTileValue };
}

// TEST HARNESS: Uncomment and run in Node or browser console to test specific board states
/*
function testBotMove(board, usedO, deadO, difficulty, usedX, deadX) {
  const result = getBotMove(board, usedO, deadO, difficulty, usedX, deadX);
  console.log('Bot move:', result);
}
// Example board state: X in corners, O in center, rest empty
const board = [
  { value: 1, type: 'X' }, // 0
  { value: null, type: null }, // 1
  { value: 1, type: 'X' }, // 2
  { value: null, type: null }, // 3
  { value: 2, type: 'O' }, // 4
  { value: null, type: null }, // 5
  { value: 2, type: 'X' }, // 6
  { value: null, type: null }, // 7
  { value: null, type: null } // 8
];
const usedO = [false, false, false, false, false, false];
const deadO = [false, false, false, false, false, false];
const usedX = [true, false, true, false, true, false];
const deadX = [false, false, false, false, false, false];
console.log('Hard difficulty:');
testBotMove(board, usedO, deadO, 2, usedX, deadX);
console.log('Medium difficulty:');
testBotMove(board, usedO, deadO, 1, usedX, deadX);
console.log('Easy difficulty:');
testBotMove(board, usedO, deadO, 0, usedX, deadX);
*/

// AUTOMATED TEST CASES
/* function runBotMoveTests() {
  const testCases = [
    {
      name: 'Block win',
      board: [
        { value: 1, type: 'X' }, { value: 1, type: 'X' }, { value: null, type: null },
        { value: null, type: null }, { value: null, type: null }, { value: null, type: null },
        { value: null, type: null }, { value: null, type: null }, { value: null, type: null }
      ],
      usedO: [false, false, false, false, false, false],
      deadO: [false, false, false, false, false, false],
      usedX: [true, true, false, false, false, false],
      deadX: [false, false, false, false, false, false],
      expectedMove: 2
    },
    {
      name: 'Create fork',
      board: [
        { value: 1, type: 'O' }, { value: null, type: null }, { value: null, type: 'X' },
        { value: null, type: null }, { value: 2, type: 'X' }, { value: null, type: null },
        { value: null, type: null }, { value: null, type: null }, { value: 1, type: 'O' }
      ],
      usedO: [true, false, false, false, false, true],
      deadO: [false, false, false, false, false, false],
      usedX: [false, false, false, false, true, false],
      deadX: [false, false, false, false, false, false],
      expectedMove: 2 // Fork at index 2
    },
    {
      name: 'Play opposite corner',
      board: [
        { value: 1, type: 'X' }, { value: null, type: null }, { value: null, type: null },
        { value: null, type: null }, { value: null, type: null }, { value: null, type: null },
        { value: null, type: null }, { value: null, type: null }, { value: null, type: null }
      ],
      usedO: [false, false, false, false, false, false],
      deadO: [false, false, false, false, false, false],
      usedX: [true, false, false, false, false, false],
      deadX: [false, false, false, false, false, false],
      expectedMove: 8 // Opposite corner
    }
  ];
  ['Easy', 'Medium', 'Hard'].forEach((diffLabel, diff) => {
    console.log(`\nTesting difficulty: ${diffLabel}`);
    testCases.forEach(tc => {
      const result = getBotMove(tc.board, tc.usedO, tc.deadO, diff, tc.usedX, tc.deadX);
      console.log(`Test: ${tc.name}`);
      console.log('Bot move:', result);
      if (diff === 2 && tc.expectedMove !== undefined) {
        console.log('Expected move index:', tc.expectedMove, 'Actual:', result.moveIdx);
        console.log(result.moveIdx === tc.expectedMove ? 'PASS' : 'FAIL');
      }
    });
  });
}
// Uncomment to run automated tests
runBotMoveTests(); */
