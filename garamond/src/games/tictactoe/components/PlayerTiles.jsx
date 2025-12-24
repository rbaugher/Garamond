import React from 'react';
import { valuesMap } from '../functions/helperFunctions/pieceHelpers';

function PlayerTiles({
  queueO,
  deadO,
  queueX,
  deadX,
  turn,
  winner,
  isMobile,
  gamemode,
  onSelectPiece,
}) {
  const TileList = ({ player }) => (
    <section className={`${player}Playertiles${winner.player === player ? ' winner-border' : ''}`}>
      {valuesMap.map((val, idx) => (
        <div
          key={`${player}-${idx}`}
          className={`${player.toLowerCase()}-tile commontile${(player === 'O' ? queueO[idx] : queueX[idx]) ? ' used' : ''}${(player === 'O' ? deadO[idx] : deadX[idx]) ? ' dead' : ''}${turn === player ? '' : ' unselectable'}`}
          onClick={turn === player && !(gamemode === 0 && player === 'O') ? () => onSelectPiece(player, idx, val) : undefined}
        >
          {val}
        </div>
      ))}
    </section>
  );

  // On desktop, render as sibling sections that align with the gameboard grid
  // Grid areas: XTiles (left), Board (center), OTiles (right)
  if (!isMobile) {
    return (
      <>
        <TileList player="X" />
        <TileList player="O" />
      </>
    );
  }

  // On mobile, stack them vertically
  return (
    <div className="player-tiles-row">
      <TileList player="O" />
      <TileList player="X" />
    </div>
  );
}

export default PlayerTiles;
