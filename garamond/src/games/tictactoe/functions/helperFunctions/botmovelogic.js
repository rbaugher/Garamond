// src/games/tictactoe/functions/botMoves/botmovelogic.js
// Pure helper functions and constants for bot move logic across all difficulty modes

import { valuesMap, getMaxAvailablePieceValue } from './pieceHelpers';

// Shared board constants
export const WINNING_CONDITIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export const CORNERS = [0, 2, 6, 8];
export const SIDES = [1, 3, 5, 7];
export const CENTER = 4;

// Helper: find winning move for a player
export function findWinningMove(board, player, context) {
  const { winningConditions, emptyIndices, botPlayer, availableOpponentPieceValues } = context;
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
      // Find the empty index
      const emptyIdx = condition[values.indexOf(null)];

      // Check if the opponent can overtake the bot's piece
      const botBlockingIdx = condition.find(idx => board[idx].player === botPlayer);
      const opponentCanOvertake = botBlockingIdx !== undefined &&
        availableOpponentPieceValues().some(value => value > board[botBlockingIdx].value);

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

// Helper: find blocking move for a player
export function findBlockingMove(board, player, context) {
  const { winningConditions, emptyIndices, availablePieceIndices, availableOpponentPieceIndices, botPlayer, opponent, deadO, deadX } = context;
  let blockMoveIdx = null;
  let blockPieceIdx = null;
  let reason = null;

  const opponentPlayer = player === 'O' ? 'X' : 'O';

  // Find the opponent's winning move
  const moveIdx = findWinningMove(board, opponentPlayer, context);
  if (moveIdx.idx !== null) {
    if (board[moveIdx.idx].value === null) {
      // Block by placing the highest-value piece that matches or exceeds the opponent's max piece
      const maxOpponentValue = getMaxAvailablePieceValue(deadX);
      const pieceValues = availablePieceIndices().map(i => valuesMap[i]).filter(v => v >= maxOpponentValue);

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
        i => board[i].player === opponentPlayer && board[i].value < getMaxAvailablePieceValue(deadO)
      );
      if (takeoverable.length > 0) {
        // Check if the winning move involves overtaking an opponent's piece
        const mIdx = takeoverable[0]; // Pick the first takeoverable index
        const possiblePieces = availablePieceIndices().map(i => valuesMap[i]).filter(v => v > board[mIdx].value);

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
export function findSetupMove(board, player, context) {
  const { winningConditions, emptyIndices, takeoverIndices, availablePieceIndices, opponent, botPlayer, deadO, deadX } = context;
  
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    const line = [board[a], board[b], board[c]];
    const values = line.map(t => t.player);
    let conditionsMet = [];
    
    // Setup if bot has 1, opponent has none, and 2 empty
    if (values.filter(v => v === player).length === 1 && values.filter(v => v !== null && v !== player).length === 0) {
      conditionsMet.push(a, b, c);
    }
    // Setup if bot has 1, opponent has 1 (less than max number that bot has), and 1 empty
    if (values.filter(v => v === player).length === 1 && values.filter(v => v === opponent).length === 1 && values.filter(v => v === null).length === 1) {
      const opponentIdx = condition[values.indexOf(opponent)];
      if (board[opponentIdx].value < getMaxAvailablePieceValue(deadO)) {
        conditionsMet.push(a, b, c);
      }
    }
    // Setup if bot has 1, opponent has 2 (less than max number that bot has)
    if (values.filter(v => v === player).length === 1 && values.filter(v => v === opponent).length === 2) {
      const opponentIdxs = condition.filter(i => board[i].player === opponent);
      if (opponentIdxs.every(idx => board[idx].value < getMaxAvailablePieceValue(deadO))) {
        conditionsMet.push(a, b, c);
      }
    }
    
    // If any conditions met, pick the index that appears most often in conditionsMet
    if (conditionsMet.length > 0) {
      const freqMap = {};
      conditionsMet.forEach(idx => { freqMap[idx] = (freqMap[idx] || 0) + 1; });
      const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
      const targetIdx = parseInt(sorted[0][0]);
      
      // Check if targetIdx is in available moves (empty or takeover)
      const availableMoves = emptyIndices.concat(takeoverIndices).sort((a, b) => a - b).filter(idx => board[idx].player !== botPlayer);
      if (availableMoves.includes(targetIdx)) {
        const candidateVals = availablePieceIndices().map(i => valuesMap[i]).filter(v => v > (board[targetIdx].value || 0));
        
        if (emptyIndices.includes(targetIdx)) {
          if (candidateVals.length > 0) {
            const chosenVal = Math.min(...candidateVals);
            const pieceIdx = availablePieceIndices().find(i => valuesMap[i] === chosenVal);
            return { moveIdx: targetIdx, pieceIdx, moveReason: 'setup' };
          }
        } else if (takeoverIndices.includes(targetIdx)) {
          const maxOpponentValue = getMaxAvailablePieceValue(deadX);
          const candidateVals2 = availablePieceIndices().map(i => valuesMap[i]).filter(v => v >= maxOpponentValue && v > board[targetIdx].value);
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

// Helper: find fork move
export function findForkMove(board, player, context) {
  const { winningConditions, emptyIndices } = context;
  const forkIndices = [];
  
  for (let idx of emptyIndices) {
    let forkCount = 0;
    for (let condition of winningConditions) {
      if (condition.includes(idx)) {
        const line = condition.map(i => board[i]);
        const values = line.map(t => t.player);
        if (values.filter(v => v === player).length === 1 && values.filter(v => v === null).length === 2) {
          forkCount++;
        }
      }
    }
    if (forkCount >= 2) forkIndices.push(idx);
  }
  return forkIndices.length > 0 ? forkIndices[0] : null;
}

// Helper: block opponent's fork
export function findBlockForkMove(board, player, context) {
  const { winningConditions, emptyIndices } = context;
  const opponent = player === 'O' ? 'X' : 'O';
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

// Helper: find opposite corner move
export function findOppositeCornerMove(board, player) {
  const opponent = player === 'O' ? 'X' : 'O';
  const opposite = { 0: 8, 2: 6, 6: 2, 8: 0 };
  
  for (let c of CORNERS) {
    if (board[c].player === opponent && board[opposite[c]].value === null) {
      return opposite[c];
    }
  }
  return null;
}

// Helper: find empty side move
export function findEmptySideMove(board) {
  for (let s of SIDES) {
    if (board[s].value === null) return s;
  }
  return null;
}

// Helper: find takeover move
export function findTakeoverMove(board, player, context) {
  const { availablePieceIndices, botPlayer, opponent, emptyIndices, takeoverIndices, deadO, deadX } = context;
  const candidateMoves = [];
  const availableMoves = emptyIndices.concat(takeoverIndices).sort((a, b) => a - b).filter(idx => board[idx].player !== botPlayer);

  for (let idx = 0; idx < board.length; idx++) {
    if (board[idx].player === opponent && board[idx].value !== null) {
      for (let pieceIdx of availablePieceIndices()) {
        const pieceValue = valuesMap[pieceIdx];
        if (pieceValue > board[idx].value) {
          // simulate takeover and check tactical value
          const simBoard = board.map((t, i) => i === idx ? { value: pieceValue, player: player } : { ...t });
          // if takeover creates immediate win, prefer it
          const winAfter = findWinningMove(simBoard, player, context);
          if (winAfter.idx !== null) {
            return { moveIdx: idx, pieceIdx: pieceIdx, moveReason: 'takeover win' };
          }
          const forkAfter = findForkMove(simBoard, player, context);
          // if takeover creates fork, prefer it
          if (forkAfter !== null) {
            return { moveIdx: idx, pieceIdx: pieceIdx, moveReason: 'takeover fork' };
          }
          if (!candidateMoves.includes(idx)) candidateMoves.push(idx);
        }
      }
    }
  }

  // All possible takeovers, prefer taking a 2 with a 3
  for (let idx of candidateMoves) {
    if (availableMoves.includes(idx) && board[idx].value === 2) {
      const chosenVal = getMaxAvailablePieceValue(deadO);
      const pieceIdx = availablePieceIndices().find(i => valuesMap[i] === chosenVal);
      return { moveIdx: idx, pieceIdx, moveReason: 'takeover 2' };
    }
  }
  return null;
}
