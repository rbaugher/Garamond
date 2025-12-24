import { valuesMap } from '../helperFunctions/pieceHelpers';

export function getEasyMove(board, context) {
  const { availablePieceIndices, availableMoves } = context;
  const VERBOSE = false;

  // Easy: random valid move
  const moves = availableMoves();
  const moveIdx = moves[Math.floor(Math.random() * moves.length)];
  
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
