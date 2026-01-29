import React from 'react';

const getDiscDisplay = (value) => {
  if (value === -1) return '❄️';
  if (value === 0) return 'X';
  return value;
};

export default function Board({ board, winningCells, completedLines, onCellClick, columns, rows }) {
  // Create a map of cell index to winning player
  const cellToWinningPlayer = {};
  if (completedLines) {
    completedLines.forEach(line => {
      line.cells.forEach(cellIdx => {
        cellToWinningPlayer[cellIdx] = line.player;
      });
    });
  }

  return (
    <div className="connect10-board" role="grid" aria-label="Reactor Control board">
      {board.map((cell, idx) => {
        const isWinningCell = winningCells.includes(idx);
        const winningPlayer = cellToWinningPlayer[idx];
        const isClickable = onCellClick && cell.value !== null;
        
        return (
          <div
            key={idx}
            className={`connect10-cell ${isWinningCell ? `winning-cell winning-${winningPlayer}` : ''} ${isClickable ? 'clickable' : ''}`}
            role="gridcell"
            aria-colindex={(idx % columns) + 1}
            aria-rowindex={Math.floor(idx / columns) + 1}
            onClick={() => isClickable && onCellClick(idx)}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
          >
            {cell.value !== null && (
              <div className={`connect10-disc player-${cell.player} ${cell.isSpecial ? 'special-node' : ''}`}>
                {getDiscDisplay(cell.value)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
