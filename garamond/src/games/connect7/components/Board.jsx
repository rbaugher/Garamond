import React from 'react';

export default function Board({ board, winningCells, onCellClick, columns, rows }) {
  return (
    <div className="connect7-board" role="grid" aria-label="Connect 7 board">
      {board.map((cell, idx) => {
        const isWinningCell = winningCells.includes(idx);
        return (
          <div
            key={idx}
            className={`connect7-cell ${isWinningCell ? 'winning-cell' : ''}`}
            role="gridcell"
            aria-colindex={(idx % columns) + 1}
            aria-rowindex={Math.floor(idx / columns) + 1}
            onClick={() => onCellClick && onCellClick(idx)}
          >
            {cell.value && (
              <div className={`connect7-disc player-${cell.player}`}>
                <span className="disc-value">{cell.value}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
