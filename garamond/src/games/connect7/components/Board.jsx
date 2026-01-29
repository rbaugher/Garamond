import React from 'react';

// Map values to display icons
const getNodeIcon = (value) => {
  const iconMap = {
    1: '⚪',
    2: '🔵',
    3: '🔴',
    '-1': '❄️',
    0: '⚠️',
  };
  return iconMap[String(value)] || value;
};

export default function Board({ board, winningCells, onCellClick, columns, rows }) {
  return (
    <div className="connect10-board" role="grid" aria-label="Reactor Control board">
      {board.map((cell, idx) => {
        const isWinningCell = winningCells.includes(idx);
        const isClickable = onCellClick && cell.value !== null;
        
        return (
          <div
            key={idx}
            className={`connect10-cell ${isWinningCell ? 'winning-cell' : ''} ${isClickable ? 'clickable' : ''}`}
            role="gridcell"
            aria-colindex={(idx % columns) + 1}
            aria-rowindex={Math.floor(idx / columns) + 1}
            onClick={() => isClickable && onCellClick(idx)}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
          >
            {cell.value !== null && (
              <div className={`connect10-disc player-${cell.player} ${cell.isSpecial ? 'special-node' : ''}`}>
                <span className="disc-value">{getNodeIcon(cell.value)}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
