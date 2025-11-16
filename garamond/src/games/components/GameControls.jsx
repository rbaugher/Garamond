import React, { useState, useEffect } from 'react';
import Difficulty from './subcomponents/difficultySlider';
import GameMode from './subcomponents/gamemodeSelector';
import { useDifficulty } from './context/DifficultyContext';
import { useGameMode } from './context/gamemodeContext';
import './GameControls.css';

function GameControls({ activeControl, onClose }) {
  const { difficulty, setDifficulty } = useDifficulty();
  const { gamemode, setGameMode } = useGameMode();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (activeControl) {
      setShowOverlay(true);
    }
  }, [activeControl]);

  const handleClose = () => {
    setShowOverlay(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!activeControl || !showOverlay) return null;

  return (
    <div className={`game-controls-overlay${showOverlay ? ' show' : ''}`} onClick={handleClose}>
      <div className="game-controls-modal" onClick={(e) => e.stopPropagation()}>
        <button className="controls-close-btn" onClick={handleClose}>✕</button>
        
        <div className="controls-content">
          {activeControl === 'difficulty' && (
            <div className="control-panel">
              <h2>Difficulty Level</h2>
              <Difficulty 
                level={difficulty} 
                onChange={(value) => {
                  setDifficulty(value);
                }}
              />
            </div>
          )}

          {activeControl === 'gamemode' && (
            <div className="control-panel">
              <GameMode 
                level={gamemode} 
                onChange={(value) => {
                  setGameMode(value);
                }}
                onFadeComplete={handleClose}
              />
            </div>
          )}

          {activeControl === 'mechanics' && (
            <div className="control-panel">
              <h2>Game Mechanics</h2>
              <div className="mechanics-info">
                <h3>Tic Tac Toe Squared</h3>
                <p><strong>Objective:</strong> Get three in a row on a 3×3 grid</p>
                <h4>Tile Values:</h4>
                <ul>
                  <li><strong>Tile 1:</strong> Low value - easy to place</li>
                  <li><strong>Tile 2:</strong> Medium value</li>
                  <li><strong>Tile 3:</strong> High value - hard to place</li>
                </ul>
                <p><strong>Rule:</strong> You can only place a tile if its value is higher than what's already on that space.</p>
              </div>
            </div>
          )}

          {activeControl === 'stats' && (
            <div className="control-panel">
              <h2>Statistics</h2>
              <div className="stats-info">
                <p>Statistics tracking coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameControls;
