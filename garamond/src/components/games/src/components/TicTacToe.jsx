import { useDifficulty } from "./context/DifficultyContext";
import { TurnContext } from './Board';
import React, { useEffect, useContext } from 'react';
import { useGameMode } from './context/gamemodeContext';
import { WinnerContext } from './Board';


function TicTacToe() {
  const { label } = useDifficulty();
  const { turn } = useContext(TurnContext);
  const { winner } = useContext(WinnerContext);
  const { gamemode } = useGameMode();

  return (
    <>
        <section className="title">
        <h1>Tic Tac Toe <sup>2</sup></h1>
        </section>
        {winner.player === null && gamemode === 0 && (
          <section className="display">
            {turn === 'O' ? 'Computer' : 'Player'} <span className={`display-player ${turn === 'X' ? 'playerX' : 'playerO'}`}>{turn}</span>'s turn
          </section>
        )}
        {winner.player === null && gamemode === 1 && (
          <section className="display">
            Player <span className={`display-player ${turn === 'X' ? 'playerX' : 'playerO'}`}>{turn}</span>'s turn
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