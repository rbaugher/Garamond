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
                
                <h4>Objective</h4>
                <p>Be the first player to control three squares in a row (horizontal, vertical, or diagonal).</p>
                
                <h4>Setup</h4>
                <ul>
                  <li><strong>Board:</strong> 3×3 grid</li>
                  <li><strong>Turn order:</strong> Randomly assigned at start; players alternate</li>
                  <li><strong>Tiles per player:</strong> Six tiles with values [1, 1, 2, 2, 3, 3]</li>
                </ul>
                
                <h4>How to Play</h4>
                <ol>
                  <li>Select a tile from your collection</li>
                  <li>Place it on any valid square</li>
                  <li>Once played, that tile is <strong>dead</strong> and cannot be used again</li>
                  <li>Play continues until someone wins or no valid moves remain</li>
                </ol>
                
                <h4>Placement Rules</h4>
                <ul>
                  <li><strong>Empty squares:</strong> You may place any tile on an empty square</li>
                  <li><strong>Overwriting opponent:</strong> You may place on an opponent's square ONLY if your tile value is higher</li>
                  <li><strong>Your own squares:</strong> You cannot overwrite your own tiles</li>
                </ul>
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
