import React from 'react';
import { useDifficulty } from '../../components/context/DifficultyContext';
import { useGameMode } from '../../components/context/gamemodeContext';

function StatusBar({ turn, winner, playerNickname }) {
  const { label } = useDifficulty();
  const { gamemode } = useGameMode();

  return (
    <>
      {winner.player === null && gamemode === 0 && (
        <section className="display">
          {turn === 'O' ? 'Computer' : playerNickname} <span className={`display-player${turn === 'X' ? 'playerX' : 'playerO'}`}></span>'s turn
        </section>
      )}
      {winner.player === null && gamemode === 1 && (
        <section className="display">
          {turn === 'X' ? playerNickname : 'Player'} <span className={`display-player${turn === 'X' ? 'playerX' : 'playerO'}`}></span>'s turn
        </section>
      )}
      {gamemode !== 1 && (
        <section className="perm-display">
          Difficulty: <span className="display-difficulty">{label}</span>
        </section>
      )}
    </>
  );
}

export default StatusBar;
