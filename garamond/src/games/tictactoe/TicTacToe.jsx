import { useDifficulty } from '../components/context/DifficultyContext';
import { TurnContext } from './Board';
import React, { useEffect, useContext } from 'react';
import { useGameMode } from '../components/context/gamemodeContext';
import { WinnerContext } from './Board';
import { getStoredUser } from '../../utils/session';


function TicTacToe() {
  const { label } = useDifficulty();
  const { turn } = useContext(TurnContext);
  const { winner } = useContext(WinnerContext);
  const { gamemode } = useGameMode();
  
  // Get player nickname from session
  const user = getStoredUser();
  const playerNickname = user?.nickname || "Player";

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
export default TicTacToe;
