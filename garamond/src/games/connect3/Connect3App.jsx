import React from 'react';
import './connect3.css';

export default function Connect3App() {
  // Purely presentational Connect-3 board (resembles Connect-4 grid)
  const columns = 7;
  const rows = 6;
  const cells = Array.from({ length: columns * rows });

  return (
    <div className="connect3-root">
      <div className="connect3-board" role="grid" aria-label="Connect 3 board">
        {cells.map((_, idx) => (
          <div key={idx} className="connect3-cell" role="gridcell" aria-colindex={(idx % columns) + 1} aria-rowindex={Math.floor(idx / columns) + 1}>
            <div className="connect3-disc" />
          </div>
        ))}
      </div>
      <div className="connect3-hint">Connect 3 — drop pieces to make a line of three</div>
    </div>
  );
}
