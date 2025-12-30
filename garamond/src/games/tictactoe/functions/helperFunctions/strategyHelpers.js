/**
 * FUNCTION INDEX:
 * 
 * Piece Usage Tracking:
 * - piecesUsed(deadArray) → number
 *   Counts how many pieces have been used (marked as dead)
 *   Input: deadArray (array of 6 booleans, true = used)
 *   Output: count of used pieces
 * 
 * - computeUsed3s(deadArray) → number
 *   Counts how many 3-value pieces have been used
 *   Input: deadArray (array of 6 booleans)
 *   Output: count of used 3-value pieces
 * 
 * - pieceCounts(deadArray) → {1: number, 2: number, 3: number}
 *   Counts available pieces of each value
 *   Input: deadArray (array of 6 booleans)
 *   Output: object with counts for each piece value
 * 
 * Position Evaluation:
 * - getPositionValue(idx) → number
 *   Returns strategic value of a board position
 *   Input: idx (0-8 board index)
 *   Output: 100 (center), 60 (corners), 20 (sides)
 * 
 * Opponent Analysis:
 * - maxOppValue(deadX) → number|null
 *   Gets maximum available piece value for opponent
 *   Input: deadX (opponent's dead array)
 *   Output: max piece value or null
 * 
 * - canOpponentOvertake(pieceValue, maxOppOrDeadX) → boolean
 *   Checks if opponent can overtake a piece of given value
 *   Input: pieceValue (1-3), maxOppOrDeadX (max value or dead array)
 *   Output: true if opponent can overtake, false otherwise
 * 
 * Piece Selection:
 * - validPiecesForMove(board, moveIdx, availablePieceIndices, allow3) → array
 *   Gets valid piece indices for a specific move
 *   Input: board (array of 9 tiles), moveIdx (0-8), availablePieceIndices (function), allow3 (boolean, default true)
 *   Output: array of valid piece indices
 * 
 * - canUse3(gameState, deadO, deadX) → boolean
 *   Determines if bot can use a 3-value piece based on game state
 *   Input: gameState (object with playerUsed3s, botUsed3s), deadO (bot's dead array), deadX (player's dead array)
 *   Output: true if bot can use 3, false otherwise
 * 
 * - choosePieceForPosition(moveIdx, currentValue, availablePieceIndices, gameState) → number|null
 *   Intelligently selects best piece for a position based on strategy
 *   Input: moveIdx (0-8), currentValue (current tile value), availablePieceIndices (function), gameState (object with oppPieceCounts, maxOppValue)
 *   Output: chosen piece index or null
 */

import { valuesMap, getMaxAvailablePieceValue } from './pieceHelpers';
import { CORNERS, CENTER } from './botmovelogic';

export const openingMoves = [4, 0, 2, 6, 8];

export function piecesUsed(deadArray) {
  return Array.isArray(deadArray) ? deadArray.filter(Boolean).length : 0;
}

export function computeUsed3s(deadArray) {
  if (!Array.isArray(deadArray)) return 0;
  return deadArray.filter((d, i) => d && valuesMap[i] === 3).length;
}

export function pieceCounts(deadArray) {
  const counts = { 1: 0, 2: 0, 3: 0 };
  if (!Array.isArray(deadArray)) return counts;
  deadArray.forEach((dead, idx) => {
    if (!dead) counts[valuesMap[idx]]++;
  });
  return counts;
}

export function maxOppValue(deadX) {
  return getMaxAvailablePieceValue(deadX);
}

export function getPositionValue(idx) {
  if (idx === CENTER) return 100;
  if (CORNERS.includes(idx)) return 60;
  return 20;
}

export function canOpponentOvertake(pieceValue, maxOppOrDeadX) {
  const maxOpp = Array.isArray(maxOppOrDeadX)
    ? getMaxAvailablePieceValue(maxOppOrDeadX)
    : maxOppOrDeadX;
  return (maxOpp ?? -Infinity) > pieceValue;
}

export function validPiecesForMove(board, moveIdx, availablePieceIndices, allow3 = true) {
  let valid = availablePieceIndices().filter(i => valuesMap[i] > (board[moveIdx].value || 0));
  if (!allow3) {
    const non3 = valid.filter(i => valuesMap[i] !== 3);
    if (non3.length > 0) valid = non3;
  }
  return valid;
}

export function canUse3(gameState, deadO, deadX) {
  const { playerUsed3s, botUsed3s } = gameState;
  if (playerUsed3s === 0 && botUsed3s >= 1) return false;
  const botPiecesUsed = deadO.filter(Boolean).length;
  const playerPiecesUsed = deadX.filter(Boolean).length;
  return playerUsed3s > 0 || (botPiecesUsed >= 5 && playerPiecesUsed >= 5);
}

export function choosePieceForPosition(moveIdx, currentValue, availablePieceIndices, gameState) {
  const { oppPieceCounts, maxOppValue } = gameState;
  const validPieces = availablePieceIndices().filter(i => valuesMap[i] > currentValue);
  if (validPieces.length === 0) return null;
  
  const posValue = getPositionValue(moveIdx);
  
  const ones = validPieces.filter(i => valuesMap[i] === 1);
  const twos = validPieces.filter(i => valuesMap[i] === 2);
  const threes = validPieces.filter(i => valuesMap[i] === 3);
  
  if (posValue <= 20 && ones.length > 0) {
    return ones[0];
  }
  
  if (posValue >= 60) {
    if (oppPieceCounts[3] > 0 && twos.length > 0) {
      return twos[0];
    }
    if (maxOppValue <= 2 && ones.length > 0) {
      return ones[0];
    }
    if (maxOppValue <= 1 && ones.length > 0) {
      return ones[0];
    }
  }
  
  if (ones.length > 0) return ones[0];
  if (twos.length > 0) return twos[0];
  if (threes.length > 0) return threes[0];
  
  return validPieces[0];
}
