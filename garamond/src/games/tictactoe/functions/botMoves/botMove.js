// Coordinator: Routes bot move requests to appropriate difficulty strategy
// Wires game state and imports helper functions from botmovelogic

import { getAvailablePieceIndices, getAvailablePieceValues, getMaxAvailablePieceValue } from '../helperFunctions/pieceHelpers';
import { WINNING_CONDITIONS } from '../helperFunctions/botmovelogic';
import { getEasyMove } from './easyMode';
import { getMediumMove } from './mediumMode';
import { getHardMove } from './hardMode';
import { getAIMove } from './aiMode';

export function getBotMove(board, deadO, difficulty, deadX) {
  const botPlayer = 'O';
  const opponent = 'X';

  // Closure helpers for this game state
  const availablePieceIndices = () => getAvailablePieceIndices(deadO);
  const availableOpponentPieceIndices = () => getAvailablePieceIndices(deadX);

  // Board analysis
  const maxAvailable = getMaxAvailablePieceValue(deadO);
  const emptyIndices = board
    .map((tile, idx) => tile.value === null ? idx : null)
    .filter(idx => idx !== null);
  const takeoverIndices = board
    .map((tile, idx) => tile.player === opponent ? idx : null)
    .filter(tile => tile !== null)
    .filter(tile => maxAvailable != null && board[tile].value < maxAvailable);

  function availableMoves() {
    const moves = emptyIndices.concat(takeoverIndices).sort((a, b) => a - b);
    return moves.filter(idx => board[idx].player !== botPlayer);
  }

  // Context passed to strategy functions
  const context = {
    availablePieceIndices,
    availableOpponentPieceIndices,
    botPlayer,
    opponent,
    winningConditions: WINNING_CONDITIONS,
    emptyIndices,
    takeoverIndices,
    deadO,
    deadX,
    availableMoves,
  };

  // Route to appropriate difficulty strategy
  let result;
  if (difficulty === 0 && deadO.filter(idx => idx === true).length < 1) {
    result = getEasyMove(board, context);
  } else if (difficulty === 1 || (difficulty === 0 && deadO.filter(idx => idx === true).length >= 1)) {
    result = getMediumMove(board, context);
  } else if (difficulty === 2) {
    result = getHardMove(board, context);
  } else if (difficulty === 3) {
    result = getAIMove(board, context);
  }

  // Fallback: if no move found, return random valid move
  if (result && result.moveIdx !== null) {
    return result;
  }

  const moves = availableMoves();
  const pieces = availablePieceIndices();
  
  if (moves.length > 0 && pieces.length > 0) {
    return {
      moveIdx: moves[Math.floor(Math.random() * moves.length)],
      pieceIdx: pieces[Math.floor(Math.random() * pieces.length)],
      moveReason: 'fallback-random'
    };
  }

  return { moveIdx: null, pieceIdx: null, moveReason: 'no-valid-moves' };
}

