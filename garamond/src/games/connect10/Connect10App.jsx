import React from 'react';
import Board from './components/Board';
import Header from './components/Header';
import Controls from './components/Controls';
import { Connect10Provider, useConnect10Context } from './context/Connect10Context';
import './connect10.css';

const COLUMNS = 7;
const ROWS = 6;

// Node display configuration
const NODE_CONFIG = [
  { value: 1, label: '⚪', name: 'Power 1', qty: 5 },
  { value: 2, label: '🔵', name: 'Power 2', qty: 4 },
  { value: 3, label: '🔴', name: 'Power 3', qty: 3 },
  { value: -1, label: '❄️', name: 'Coolant', qty: 1, isSpecial: true },
  { value: 0, label: '⚠️', name: 'Shutdown', qty: 1, isSpecial: true },
];

function NodeSupply({ player, supply, turn, winner, selectedDisc, onSelectDisc, powerRerouteMode }) {
  const isActive = turn === player && !winner && !powerRerouteMode;
  const playerClass = player === 'red' ? 'player-red' : 'player-yellow';
  
  return (
    <div className={`node-supply ${playerClass}`}>
      <div className="supply-title">{player === 'red' ? 'Red' : 'Green'} Supply</div>
      {NODE_CONFIG.map((node) => {
        const remaining = supply[String(node.value)];
        const isSelected = selectedDisc.player === player && selectedDisc.value === node.value;
        const canSelect = isActive && remaining > 0;
        
        return (
          <div
            key={node.value}
            className={`node-button ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
            onClick={() => canSelect && onSelectDisc(node.value, node.isSpecial, node.name)}
            title={`${node.name} (${remaining} remaining)`}
          >
            <div className="node-display">
              <span className="node-icon">{node.label}</span>
              {!node.isSpecial && <span className="node-value">{node.value}</span>}
            </div>
            <span className="node-count">×{remaining}</span>
          </div>
        );
      })}
    </div>
  );
}

function ScoreDisplay({ redScore, yellowScore, winner }) {
  return (
    <div className="score-display">
      <div className={`score-item ${winner === 'red' ? 'winner' : ''}`}>
        <span className="score-label">Red:</span>
        <span className="score-value">{redScore}/3</span>
      </div>
      <div className="score-divider">|</div>
      <div className={`score-item ${winner === 'yellow' ? 'winner' : ''}`}>
        <span className="score-label">Green:</span>
        <span className="score-value">{yellowScore}/3</span>
      </div>
    </div>
  );
}

function PowerRerouteButton({ player, unlocked, used, isActive, onActivate, powerRerouteMode, onCancel }) {
  if (!unlocked) return null;
  
  if (powerRerouteMode && isActive) {
    return (
      <button className="power-reroute-btn cancel" onClick={onCancel}>
        Cancel Reclaim
      </button>
    );
  }
  
  if (used || !isActive) {
    return (
      <button className="power-reroute-btn disabled" disabled title={used ? 'Already used' : 'Not your turn'}>
        ♻️ Power Reroute {used ? '(Used)' : ''}
      </button>
    );
  }
  
  return (
    <button className="power-reroute-btn active" onClick={onActivate}>
      ♻️ Power Reroute
    </button>
  );
}

function Connect10Layout() {
  const { state, actions, anyDiscPlayed } = useConnect10Context();
  const { 
    board, 
    turn, 
    winner, 
    winningCells, 
    completedLines,
    redScore,
    yellowScore,
    selectedDisc, 
    droppingColumn,
    gameMessage,
    showMessage,
    redSupply,
    yellowSupply,
    redPowerRerouteUnlocked,
    yellowPowerRerouteUnlocked,
    redPowerRerouteUsed,
    yellowPowerRerouteUsed,
    powerRerouteMode,
  } = state;

  // Handle board cell clicks for Power Reroute mode
  const handleCellClick = powerRerouteMode ? (idx) => {
    actions.reclaimNode(idx);
  } : null;

  return (
    <>
      <div className="reactor-control-container">
        <ScoreDisplay redScore={redScore} yellowScore={yellowScore} winner={winner} />
        
        <div className="connect10-root">
          <NodeSupply 
            player="red" 
            supply={redSupply} 
            turn={turn} 
            winner={winner}
            selectedDisc={selectedDisc}
            onSelectDisc={actions.selectDisc}
            powerRerouteMode={powerRerouteMode}
          />
          
          <div className="board-container">
            <Header
              columns={COLUMNS}
              selectedDisc={selectedDisc.player}
              droppingColumn={droppingColumn}
              onHeaderClick={powerRerouteMode ? null : actions.dropDisc}
            />
            <Board
              board={board}
              winningCells={winningCells}
              completedLines={completedLines}
              onCellClick={handleCellClick}
              columns={COLUMNS}
              rows={ROWS}
            />
          </div>
          
          <NodeSupply 
            player="yellow" 
            supply={yellowSupply} 
            turn={turn} 
            winner={winner}
            selectedDisc={selectedDisc}
            onSelectDisc={actions.selectDisc}
            powerRerouteMode={powerRerouteMode}
          />
        </div>

        <div className="game-controls-row">
          <PowerRerouteButton 
            player="red"
            unlocked={redPowerRerouteUnlocked}
            used={redPowerRerouteUsed}
            isActive={turn === 'red' && !winner}
            onActivate={actions.activatePowerReroute}
            powerRerouteMode={powerRerouteMode}
            onCancel={actions.cancelPowerReroute}
          />
          
          <div className="connect10-hint">
            {showMessage ? gameMessage : 'Reactor Control — stabilize 3 lines summing to 10'}
          </div>
          
          <PowerRerouteButton 
            player="yellow"
            unlocked={yellowPowerRerouteUnlocked}
            used={yellowPowerRerouteUsed}
            isActive={turn === 'yellow' && !winner}
            onActivate={actions.activatePowerReroute}
            powerRerouteMode={powerRerouteMode}
            onCancel={actions.cancelPowerReroute}
          />
        </div>
      </div>
      
      <section style={{ textAlign: 'center', marginTop: '1em' }}>
        {anyDiscPlayed && <Controls onClick={actions.reset} />}
      </section>
    </>
  );
}

export default function Connect10App() {
  return (
    <Connect10Provider>
      <Connect10Layout />
    </Connect10Provider>
  );
}
