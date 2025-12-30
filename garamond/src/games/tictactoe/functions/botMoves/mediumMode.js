import { valuesMap } from '../helperFunctions/pieceHelpers';
import { getEasyMove } from './easyMode';
import { 
  findWinningMove, 
  findBlockingMove,
  isThreatLine,
  isSetupLine,
  hasTwoOfPlayer,
  countEmptyInLine
} from '../helperFunctions/botmovelogic';
import {
  pieceCounts,
  computeUsed3s,
  maxOppValue as getMaxOppValue,
  validPiecesForMove,
  getPositionValue as getPosValue,
  openingMoves,
  canOpponentOvertake as canOppOvertake,
  canUse3 as canUse3Helper,
  choosePieceForPosition as choosePieceHelper
} from '../helperFunctions/strategyHelpers';

// Medium mode now uses the advanced strategy
export function getMediumMove(board, context) {
  const {
    availablePieceIndices,
    availableMoves,
    botPlayer,
    opponent,
    winningConditions,
    deadO,
    deadX
  } = context;

  const VERBOSE = false;
  // Scoring constants for readability and future tuning
  const WIN_SCORE = 10000;
  const THREAT_SCORE = 300;
  const SECURE_THREAT_BONUS = 200;
  const SAFE_PLACEMENT_BONUS = 150;
  const THREE_LOW_POS_PENALTY = -500;
  const THREE_NON_CENTER_PENALTY = -300;
  const THREE_GENERAL_PENALTY = -200;
  const PREFER_ONE_BONUS = 100;
  const PREFER_TWO_BONUS = 50;
  const TAKEOVER_BASE_BONUS = 50;
  const TAKEOVER_POS_SCALE = 0.5;
  const BLOCKED_THREAT_BONUS = 250;
  const moves = availableMoves();
  
  // Compute piece counts once
  const oppPieceCounts = pieceCounts(deadX);
  const maxOppValue = getMaxOppValue(deadX);
  const playerUsed3s = computeUsed3s(deadX);
  const botUsed3s = computeUsed3s(deadO);
  
  if (VERBOSE) console.log("Opp pieces:", oppPieceCounts);
  
  const gameState = { oppPieceCounts, maxOppValue, playerUsed3s, botUsed3s };
  const getPositionValue = (idx) => getPosValue(idx);
  const canOpponentOvertake = (pieceValue) => canOppOvertake(pieceValue, deadX);
  const choosePieceForPosition = (moveIdx, currentValue = 0) => 
    choosePieceHelper(moveIdx, currentValue, availablePieceIndices, gameState);
  
  // --- Scoring helpers ---
  function scoreImmediateWin(simBoard, pieceValue) {
    const winAfter = findWinningMove(simBoard, botPlayer);
    if (winAfter.idx !== null) {
      return WIN_SCORE + (4 - pieceValue) * 100;
    }
    return 0;
  }

  function scoreThreats(simBoard, moveIdx) {
    let threats = 0;
    let secureThreats = 0;
    for (let condition of winningConditions) {
      if (condition.includes(moveIdx)) {
        const values = condition.map(i => simBoard[i].player);
        if (isThreatLine(values, botPlayer)) {
          threats++;
          const botPiecesInLine = condition.filter(i => simBoard[i].player === botPlayer);
          const allSecure = botPiecesInLine.every(i => simBoard[i].value === 3 || (simBoard[i].value === 2 && oppPieceCounts[3] === 0));
          if (allSecure) secureThreats++;
        }
      }
    }
    return threats * THREAT_SCORE + secureThreats * SECURE_THREAT_BONUS;
  }

  const scorePosition = (moveIdx) => getPositionValue(moveIdx);

  const scoreSafety = (pieceValue) => (!canOpponentOvertake(pieceValue) ? SAFE_PLACEMENT_BONUS : 0);

  function scorePieceEconomy(pieceValue, posValue) {
    let s = 0;
    if (pieceValue === 3) {
      if (posValue <= 20) s += THREE_LOW_POS_PENALTY;
      else if (posValue < 100 && oppPieceCounts[3] === 0) s += THREE_NON_CENTER_PENALTY;
      else if (oppPieceCounts[3] === 0) s += THREE_GENERAL_PENALTY;
    }
    if (pieceValue === 1) s += PREFER_ONE_BONUS;
    else if (pieceValue === 2) s += PREFER_TWO_BONUS;
    return s;
  }

  function scoreTakeover(moveIdx, posValue) {
    if (board[moveIdx].player === opponent) {
      return TAKEOVER_BASE_BONUS + posValue * TAKEOVER_POS_SCALE;
    }
    return 0;
  }

  function scoreBlockedThreats(moveIdx) {
    let blockedThreats = 0;
    for (let condition of winningConditions) {
      if (condition.includes(moveIdx)) {
        const values = condition.map(i => board[i].player);
        if (hasTwoOfPlayer(values, opponent)) {
          blockedThreats++;
        }
      }
    }
    return blockedThreats * BLOCKED_THREAT_BONUS;
  }

  function evaluateMove(moveIdx, pieceIdx) {
    const pieceValue = valuesMap[pieceIdx];
    const simBoard = board.map((t, i) => (
      i === moveIdx ? { value: pieceValue, player: botPlayer } : { ...t }
    ));

    const posValue = getPositionValue(moveIdx);

    return (
      scoreImmediateWin(simBoard, pieceValue) +
      scoreThreats(simBoard, moveIdx) +
      scorePosition(moveIdx) +
      scoreSafety(pieceValue) +
      scorePieceEconomy(pieceValue, posValue) +
      scoreTakeover(moveIdx, posValue) +
      scoreBlockedThreats(moveIdx)
    );
  }
  
  const totalPiecesUsed = deadO.filter(Boolean).length + deadX.filter(Boolean).length;
  if (totalPiecesUsed === 0) {
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
  
  const canUse3 = () => canUse3Helper(gameState, deadO, deadX);
  
  const winIdx = findWinningMove(board, botPlayer, context);
  if (winIdx.idx !== null) {
    let candidatePieces = availablePieceIndices().filter(i => valuesMap[i] > (board[winIdx.idx].value || 0));
    if (!canUse3()) {
      const non3Pieces = candidatePieces.filter(i => valuesMap[i] !== 3);
      if (non3Pieces.length > 0) {
        candidatePieces = non3Pieces;
      }
    }
    if (candidatePieces.length > 0) {
      const bestIdx = candidatePieces.reduce((a,b) => valuesMap[a] < valuesMap[b] ? a : b);
      return { moveIdx: winIdx.idx, pieceIdx: bestIdx, moveReason: 'win' };
    }
  }
  if (VERBOSE) console.log("No immediate win");

  const blockObj = findBlockingMove(board, botPlayer, context);
  if (blockObj.moveIdx !== null) {
    if (VERBOSE) console.log("Blocking opponent win at", blockObj.moveIdx);
    return blockObj;
  }
  if (VERBOSE) console.log("No block needed");

  function getValidPiecesForMove(moveIdx) {
    return validPiecesForMove(board, moveIdx, availablePieceIndices, canUse3());
  }

  for (let moveIdx of moves) {
    const validPieces = getValidPiecesForMove(moveIdx);
    for (let pieceIdx of validPieces) {
      const score = evaluateMove(moveIdx, pieceIdx);
      const FORK_SCORE_THRESHOLD = 800;
      if (score >= FORK_SCORE_THRESHOLD) {
        if (VERBOSE) console.log("Fork opportunity at", moveIdx, "with score", score);
        return { moveIdx, pieceIdx, moveReason: 'fork' };
      }
    }
  }
  if (VERBOSE) console.log("No fork found");

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    const values = [board[a].player, board[b].player, board[c].player];
    if (isSetupLine(values, opponent)) {
      for (let idx of [a, b, c]) {
        if (board[idx].value === null && moves.includes(idx)) {
          const validPieces = getValidPiecesForMove(idx);
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

  const threes = availablePieceIndices().filter(i => valuesMap[i] === 3);
  if (threes.length > 0 && oppPieceCounts[3] > 0) {
    if (board[4].player === opponent && board[4].value === 2 && moves.includes(4)) {
      const pieceIdx = threes[0];
      const score = evaluateMove(4, pieceIdx);
      if (score > 600) {
        if (VERBOSE) console.log("Critical 3-takeover of center");
        return { moveIdx: 4, pieceIdx, moveReason: 'critical 3 takeover' };
      }
    }
  }
  if (VERBOSE) console.log("No critical 3-takeover needed");

  let bestMove = null;
  let bestScore = -Infinity;
  
  for (let moveIdx of moves) {
    const validPieces = getValidPiecesForMove(moveIdx);
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

  if (VERBOSE) console.log("Fallback to random");
  const fallback = getEasyMove(board, context);
  
  if (fallback.moveIdx === null || fallback.pieceIdx === null) {
    if (VERBOSE) console.log("Emergency fallback - finding ANY valid move");
    for (let moveIdx of moves) {
      const validPieces = getValidPiecesForMove(moveIdx);
      if (validPieces.length > 0) {
        return { moveIdx, pieceIdx: validPieces[0], moveReason: 'emergency fallback' };
      }
    }
  }
  
  return fallback;
}
