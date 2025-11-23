import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './GameLobby.css';

const GameLobby = () => {
  const [expandedGame, setExpandedGame] = useState(null);
  const [expandedDifficulty, setExpandedDifficulty] = useState(null);

  const games = [
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe ²',
      description: 'A strategic twist on classic Tic Tac Toe with numbered tiles.',
      image: '/images/img-1.jpg',
      route: '/game/tictactoe',
    },
    {
      id: 'chess',
      title: 'Chess',
      description: 'The classic strategy game. (Coming Soon)',
      image: '/images/img-2.jpg',
      route: '#',
      disabled: true,
    },
    {
      id: 'checkers',
      title: 'Checkers',
      description: 'Jump your way to victory. (Coming Soon)',
      image: '/images/heavens.jpg',
      route: '#',
      disabled: true,
    }
  ];

  // Leaderboard state for Tic Tac Toe
  const [leaderboard, setLeaderboard] = useState({ easy: [], medium: [], hard: [] });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState("");

  useEffect(() => {
    // Only fetch for Tic Tac Toe and when a difficulty is selected
    if (expandedGame === 'tictactoe' && expandedDifficulty) {
      setLoadingLeaderboard(true);
      setErrorLeaderboard("");
      const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
      fetch(`${apiBase}/api/leaderboard?gameType=Tic%20Tac%20Toe%20Squared&difficulty=${expandedDifficulty}`)
        .then(res => res.json())
        .then(data => {
          setLeaderboard(lb => ({ ...lb, [expandedDifficulty]: data.leaderboard || [] }));
          setLoadingLeaderboard(false);
        })
        .catch(err => {
          setErrorLeaderboard("Failed to load leaderboard");
          setLoadingLeaderboard(false);
        });
    }
  }, [expandedGame, expandedDifficulty]);

  const handleLeaderboardToggle = (e, gameId) => {
    e.preventDefault();
    setExpandedGame(expandedGame === gameId ? null : gameId);
    setExpandedDifficulty(null); // Reset difficulty selection when toggling game
  };

  const handleDifficultySelect = (difficulty) => {
    setExpandedDifficulty(expandedDifficulty === difficulty ? null : difficulty);
  };

  return (
    <div className="game-lobby">
      <div className="game-lobby-container">
        <h1 className="game-lobby-title">Game Lobby</h1>
        <p className="game-lobby-subtitle">Select a game to play</p>
        
        <div className="games-grid">
          {games.map((game) => (
            <div key={game.id} className="game-card-wrapper">
              <Link
                to={game.route}
                className={`game-card ${game.disabled ? 'disabled' : ''}`}
                onClick={(e) => game.disabled && e.preventDefault()}
                role={game.disabled ? 'button' : 'link'}
                tabIndex={game.disabled ? -1 : 0}
              >
                <div 
                  className="game-card-image"
                  style={{ backgroundImage: `url(${game.image})` }}
                />
                <div className="game-card-overlay" />
                <div className="game-card-content">
                  <h2 className="game-card-title">{game.title}</h2>
                  <p className="game-card-description">{game.description}</p>
                </div>
              </Link>
              
              {/* Leaderboard Expander */}
              <button
                className={`leaderboard-toggle ${expandedGame === game.id ? 'expanded' : ''}`}
                onClick={(e) => handleLeaderboardToggle(e, game.id)}
                aria-expanded={expandedGame === game.id}
                aria-label={`Toggle leaderboard for ${game.title}`}
              >
                <span>Leaderboard</span>
                {expandedGame === game.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>

              {/* Expandable Leaderboard */}
              <div className={`leaderboard ${expandedGame === game.id ? 'expanded' : ''}`}>
                {/* Difficulty Tabs */}
                <div className="difficulty-tabs">
                  {['easy', 'medium', 'hard'].map((difficulty) => (
                    <button
                      key={difficulty}
                      className={`difficulty-tab ${expandedDifficulty === difficulty ? 'active' : ''}`}
                      onClick={() => handleDifficultySelect(difficulty)}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Difficulty-Specific Leaderboards */}
                {expandedDifficulty && game.id === 'tictactoe' && (
                  loadingLeaderboard ? (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>Loading leaderboard...</div>
                  ) : errorLeaderboard ? (
                    <div style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>{errorLeaderboard}</div>
                  ) : (
                    <table className="leaderboard-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Player</th>
                          <th>Wins</th>
                          <th>Win Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard[expandedDifficulty].length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center' }}>No data yet</td></tr>
                        ) : leaderboard[expandedDifficulty].map((entry) => (
                          <tr key={entry.rank}>
                            <td className="rank-badge">#{entry.rank}</td>
                            <td>{entry.player}</td>
                            <td>{entry.wins}</td>
                            <td>{entry.winRate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
