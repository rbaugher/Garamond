import React from 'react';

export default function Header({ 
  columns, 
  selectedDisc, 
  droppingColumn, 
  onHeaderClick 
}) {
  const headerDiscs = Array.from({ length: columns });

  return (
    <div className='game-header'>
      {headerDiscs.map((_, idx) => (
        <div
          key={idx}
          className={`header-cell ${selectedDisc ? 'clickable' : ''} ${droppingColumn === idx ? 'dropping' : ''}`}
          role='gridcell'
          aria-colindex={idx + 1}
          onClick={() => onHeaderClick(idx)}
        >
          <div className="header-disc"></div>
          {droppingColumn === idx && (
            <div className={`connect7-disc player-${selectedDisc} dropping-disc`}></div>
          )}
        </div>
      ))}
    </div>
  );
}
