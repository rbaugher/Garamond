import React from 'react';
import Board from './components/Board';
import Header from './components/Header';
import PlayerDiscs from './components/PlayerDiscs';
import Controls from './components/Controls';
import { Connect7Provider, useConnect7Context } from './context/Connect7Context';
import './connect7.css';

const COLUMNS = 7;
const ROWS = 6;

function Connect7Layout() {
  const { state, actions, anyDiscPlayed } = useConnect7Context();
  const { 
    board, 
    turn, 
    winner, 
    winningCells, 
    selectedDisc, 
    droppingColumn,
    gameMessage,
    showMessage 
  } = state;

  const discValues = [1, 2, 3];

  return (
    <>
      <div className="connect7-root">
        <div />
        <Header
          columns={COLUMNS}
          selectedDisc={selectedDisc.player}
          droppingColumn={droppingColumn}
          onHeaderClick={actions.dropDisc}
        />
        <div />
        <div className='player-pieces-left'>
          {discValues.map((value, idx) => (
            <div
              key={idx}
              className={`connect7-disc player-red ${
                turn === 'red' && !winner ? 'active-player' : ''
              } ${
                selectedDisc.player === 'red' && selectedDisc.value === value ? 'selected' : ''
              }`}
              onClick={() => !winner && actions.selectDisc('red', value)}
            >
              <span className="disc-value">{value}</span>
            </div>
          ))}
        </div>
        <Board
          board={board}
          winningCells={winningCells}
          onCellClick={null}
          columns={COLUMNS}
          rows={ROWS}
        />
        <div className='player-pieces-right'>
          {discValues.map((value, idx) => (
            <div
              key={idx}
              className={`connect7-disc player-yellow ${
                turn === 'yellow' && !winner ? 'active-player' : ''
              } ${
                selectedDisc.player === 'yellow' && selectedDisc.value === value ? 'selected' : ''
              }`}
              onClick={() => !winner && actions.selectDisc('yellow', value)}
            >
              <span className="disc-value">{value}</span>
            </div>
          ))}
        </div>
        <div className="connect7-hint">
          {showMessage ? gameMessage : 'Connect 10 — drop pieces to make a line that sums to 10'}
        </div>
      </div>
      <section style={{ textAlign: 'center', marginTop: '1em' }}>
        {anyDiscPlayed && <Controls onClick={actions.reset} />}
      </section>
    </>
  );
}

export default function Connect7App() {
  return (
    <Connect7Provider>
      <Connect7Layout />
    </Connect7Provider>
  );
}
