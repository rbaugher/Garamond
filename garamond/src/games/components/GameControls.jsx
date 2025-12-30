import React, { useState, useEffect } from 'react';
import Difficulty from './subcomponents/difficultySlider';
import GameMode from './subcomponents/gamemodeSelector';
import { useDifficulty } from './context/DifficultyContext';
import { useGameMode } from './context/gamemodeContext';
import { getStoredUser } from '../../utils/session';
import './GameControls.css';

function GameControls({ activeControl, onClose }) {
  const { difficulty, setDifficulty } = useDifficulty();
  const { gamemode, setGameMode } = useGameMode();
  const [showOverlay, setShowOverlay] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const user = getStoredUser();
  const playerName = user?.nickname || user?.username || null;

  useEffect(() => {
    if (activeControl) {
      setShowOverlay(true);
      
      // Fetch stats when stats panel is opened
      if (activeControl === 'stats' && playerName) {
        setLoadingStats(true);
        setStatsError(null);
        const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
        fetch(`${apiBase}/api/playerStats?playerName=${encodeURIComponent(playerName)}&gameType=Tic%20Tac%20Toe%20Squared`)
          .then(res => res.json())
          .then(data => {
            setStats(data);
            setLoadingStats(false);
          })
          .catch(err => {
            console.error('Error fetching stats:', err);
            setStatsError('Failed to load statistics');
            setLoadingStats(false);
          });
      }
    }
  }, [activeControl, playerName]);

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
                  <li>Select a piece from your collection</li>
                  <li>Place it on any valid square</li>
                  <li>Once played, that piece cannot be used again</li>
                  <li>Play continues until someone wins or no valid moves remain</li>
                </ol>
                
                <h4>Placement Rules</h4>
                <ul>
                  <li><strong>Empty squares:</strong> You may place any of your pieces on an empty square</li>
                  <li><strong>Overtaking:</strong> You may place a piece on an opponent's square <strong>ONLY</strong> if your piece value is higher</li>
                  <li><strong>Your own squares:</strong> You cannot overtake your own pieces</li>
                </ul>
              </div>
            </div>
          )}

          {activeControl === 'stats' && (
            <div className="control-panel">
              <h2>Your Statistics</h2>
              <div className="stats-info">
                {!playerName ? (
                  <p>Please sign in to view your statistics.</p>
                ) : loadingStats ? (
                  <p>Loading statistics...</p>
                ) : statsError ? (
                  <p style={{ color: '#ff6b6b' }}>{statsError}</p>
                ) : stats ? (
                  <>
                    <div className="stats-overall">
                      <h3>Overall Record</h3>
                      <p><strong>Total Games:</strong> {stats.overall.totalGames}</p>
                      <p><strong>Wins:</strong> {stats.overall.wins}</p>
                      <p><strong>Losses:</strong> {stats.overall.losses}</p>
                      <p><strong>Ties:</strong> {stats.overall.ties}</p>
                      <p><strong>Win Rate:</strong> {stats.overall.winRate}%</p>
                    </div>
                    
                    <div className="stats-by-difficulty">
                      <h3>By Difficulty</h3>
                      
                      {['Easy', 'Medium', 'Hard', 'AI'].map((label, idx) => {
                        const diffStats = stats.byDifficulty[idx];
                        if (diffStats.totalGames === 0) return null;
                        const winRate = ((diffStats.wins / diffStats.totalGames) * 100).toFixed(1);
                        return (
                          <div key={idx} className="difficulty-stats">
                            <h4>{label}</h4>
                            <p><strong>Games:</strong> {diffStats.totalGames}</p>
                            <p><strong>W/L/T:</strong> {diffStats.wins}/{diffStats.losses}/{diffStats.ties}</p>
                            <p><strong>Win Rate:</strong> {winRate}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p>No statistics available yet. Play some games to see your stats!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameControls;
