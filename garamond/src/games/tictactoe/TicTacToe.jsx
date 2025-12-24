import React from 'react';
import Board from './Board';
import Controls from './Controls';
import PlayerTiles from './components/PlayerTiles';
import StatusBar from './components/StatusBar';
import StarterPopout from './components/StarterPopout';
import { TicTacToeProvider, useTicTacToeContext } from './context/TicTacToeContext';
import { useGameMode } from '../components/context/gamemodeContext';

function TicTacToeLayout() {
  const { gamemode } = useGameMode();
  const { state, actions, anyTilePlayed, playerNickname } = useTicTacToeContext();
  const { board, winningTiles, turn, winner, queueO, queueX, deadO, deadX, isMobile, gameMessage, showMessage } = state;

  return (
    <>
      <StarterPopout turn={turn} moveCount={state.moveCount} winner={winner} />
      <StatusBar turn={turn} winner={winner} playerNickname={playerNickname} />
      <section className={`gameboard${gamemode === 1 ? ' multiplayer' : ''}${turn === 'X' ? ' x-turn' : ' o-turn'}`}>
        <PlayerTiles
          queueO={queueO}
          deadO={deadO}
          queueX={queueX}
          deadX={deadX}
          turn={turn}
          winner={winner}
          isMobile={isMobile}
          gamemode={gamemode}
          onSelectPiece={(player, idx, val) => actions.selectPiece(player, idx, val)}
        />
        <Board
          board={board}
          winningTiles={winningTiles}
          onTileClick={(idx) => actions.placePiece(idx)}
          turn={turn}
          gamemode={gamemode}
        />
      </section>
      {/* Player banner for singleplayer mode (not mobile) */}
      {gamemode === 0 && !state.isMobile && (
        <div className="playerbanner" style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2em', marginBottom: '0.5em' }}>
          {playerNickname}
        </div>
      )}
      <section style={{ textAlign: 'center', marginTop: '1em', color: 'white' }} />
      <section style={{ textAlign: 'center', color: 'white' }}>
        <span className={`game-message${showMessage ? '' : ' fade-out'}`}>{gameMessage}</span>
        {anyTilePlayed && <Controls onClick={actions.reset} />}
      </section>
    </>
  );
}

export default function TicTacToe() {
  return (
    <TicTacToeProvider>
      <TicTacToeLayout />
    </TicTacToeProvider>
  );
}
