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
