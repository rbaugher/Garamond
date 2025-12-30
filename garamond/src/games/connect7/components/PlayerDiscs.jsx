import React from 'react';

export default function PlayerDiscs({ 
  currentPlayer, 
  selectedDisc, 
  winner,
  onSelectDisc 
}) {
  const handleRedClick = () => {
    if (!winner) onSelectDisc('red');
  };

  const handleYellowClick = () => {
    if (!winner) onSelectDisc('yellow');
  };

  return (
    <>
      <div className='player-pieces-left'>
        <div
          className={`connect7-disc player-red ${currentPlayer === 'red' && !winner ? 'active-player' : ''} ${selectedDisc === 'red' ? 'selected' : ''}`}
          onClick={handleRedClick}
        ></div>
      </div>
      <div className='player-pieces-right'>
        <div
          className={`connect7-disc player-yellow ${currentPlayer === 'yellow' && !winner ? 'active-player' : ''} ${selectedDisc === 'yellow' ? 'selected' : ''}`}
          onClick={handleYellowClick}
        ></div>
      </div>
    </>
  );
}
