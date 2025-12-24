import { findWinningMove, findBlockingMove } from '../helperFunctions/botmovelogic';
import { valuesMap } from '../helperFunctions/pieceHelpers';
import { getStoredUserName } from '../../../../utils/session';
import { getEasyMove } from './easyMode';

export function getAIMove(board, context) {
  const { availablePieceIndices, availableMoves, botPlayer, opponent } = context;

  // Hard constraints first
  const winObj = findWinningMove(board, botPlayer, context);
  if (winObj && winObj.idx !== null) {
    const candidatePieces = availablePieceIndices().filter(i => valuesMap[i] > (board[winObj.idx].value || 0));
    if (candidatePieces.length > 0) {
      const bestIdx = candidatePieces.reduce((a, b) => valuesMap[a] < valuesMap[b] ? a : b);
      return { moveIdx: winObj.idx, pieceIdx: bestIdx, moveReason: 'win' };
    }
  }

  const blockObj = findBlockingMove(board, botPlayer, context);
  if (blockObj && blockObj.moveIdx !== null) {
    return blockObj;
  }

  // Fetch cached profile
  const playerName = getStoredUserName() || 'player';
  let profile = null;
  try {
    const raw = localStorage.getItem(`playerModel:${playerName}`);
    profile = raw ? JSON.parse(raw) : null;
  } catch {}
  const biases = profile?.profile || {};

  // Base position scoring
  function basePosValue(idx) {
    if (idx === 4) return 60;
    if ([0, 2, 6, 8].includes(idx)) return 40;
    return 20;
  }

  // Score each candidate move
  function scoreMove(moveIdx, pieceIdx) {
    let score = basePosValue(moveIdx);
    const pieceValue = valuesMap[pieceIdx];
    
    // Prefer smaller pieces by default
    score += pieceValue === 1 ? 10 : pieceValue === 2 ? 5 : -5;
    
    // Takeover slight bonus
    if (board[moveIdx].player === opponent) score += 10;
    
    // Apply player profile bias if available
    {
      const pw = biases.posWeights?.[moveIdx] ?? 0;
      const pp = biases.piecePrefs?.[pieceValue] ?? 0;
      const tr = biases.takeoverRate ?? 0;
      score += pw * 50;      // position preference weight
      score += pp * 20;      // piece preference weight
      if (board[moveIdx].player === opponent) score += tr * 30; // takeover propensity
    }
    
    return score;
  }

  // Find best move across all valid moves
  const moves = availableMoves();
  let best = { moveIdx: null, pieceIdx: null, score: -Infinity };
  
  for (let moveIdx of moves) {
    const validPieces = availablePieceIndices().filter(i => valuesMap[i] > (board[moveIdx].value || 0));
    for (let pieceIdx of validPieces) {
      const score = scoreMove(moveIdx, pieceIdx);
      if (score > best.score) {
        best = { moveIdx, pieceIdx, score };
      }
    }
  }

  if (best.moveIdx !== null) {
    return { moveIdx: best.moveIdx, pieceIdx: best.pieceIdx, moveReason: 'ai-bias' };
  }

  // Fallback to random
  return getEasyMove(board, context);
}
