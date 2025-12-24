import { getEasyMove } from './easyMode';
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

// Skeleton hard mode: delegate to easy until advanced logic is defined
export function getHardMove(board, context) {
  // TODO: Implement advanced hard-mode strategy
  return getEasyMove(board, context);
}
