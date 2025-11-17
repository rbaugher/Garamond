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
