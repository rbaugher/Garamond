import React from 'react';

function Board({ board, winningTiles, onTileClick, turn, gamemode }) {
  return (
    <section className="container">
      {board.map((cell, idx) => (
        <div
          key={idx}
          className={`tile${winningTiles.includes(idx) ? ' glow' : ''}`}
          onClick={() => onTileClick(idx)}
        >
          {cell.value !== null ? (
            <span
              className="inplaytile"
              style={{ background: cell.player === 'X' ? '#09C372' : cell.player === 'O' ? '#498AFB' : '#444' }}
            >
              {cell.value}
            </span>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export default Board;
