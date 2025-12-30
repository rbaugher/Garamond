/**
 * FUNCTION INDEX:
 * 
 * Core Piece Management:
 * - getAvailablePieceIndices(deadArray) → array
 *   Returns indices of all pieces that haven't been used yet
 *   Input: deadArray (array of 6 booleans, true = used)
 *   Output: array of available piece indices (0-5)
 * 
 * - getAvailablePieceValues(deadArray) → array
 *   Returns values of all available pieces
 *   Input: deadArray (array of 6 booleans)
 *   Output: array of piece values (1, 2, or 3)
 * 
 * - getMaxAvailablePieceValue(deadArray) → number|null
 *   Gets the highest value piece still available
 *   Input: deadArray (array of 6 booleans)
 *   Output: max piece value (1-3) or null if none available
 * 
 * - getFirstAvailablePieceIndex(deadArray) → number|null
 *   Gets the first available piece index
 *   Input: deadArray (array of 6 booleans)
 *   Output: first available piece index (0-5) or null
 * 
 * Constants:
 * - valuesMap: [1,1,2,2,3,3]
 *   Maps piece indices (0-5) to their values (1-3)
 *   Index 0,1 = value 1; Index 2,3 = value 2; Index 4,5 = value 3
 */

export const valuesMap = [1,1,2,2,3,3];

export function getAvailablePieceIndices(deadArray) {
  if (!Array.isArray(deadArray)) return valuesMap.map((_,i) => i);
  return valuesMap.map((v,i) => (!deadArray[i] ? i : null)).filter(i => i !== null);
}

export function getAvailablePieceValues(deadArray) {
  return getAvailablePieceIndices(deadArray).map(i => valuesMap[i]);
}

export function getMaxAvailablePieceValue(deadArray) {
  const vals = getAvailablePieceValues(deadArray);
  return vals.length ? Math.max(...vals) : null;
}

export function getFirstAvailablePieceIndex(deadArray) {
  const idx = getAvailablePieceIndices(deadArray);
  return idx.length ? idx[0] : null;
}
