import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getStoredUser } from '../../utils/session';
import './GameLobby.css';

const GameLobby = () => {
  const [expandedGame, setExpandedGame] = useState(null);
  const [expandedDifficulty, setExpandedDifficulty] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);
  const navigate = useNavigate();

  const games = [
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe ²',
      description: 'A strategic twist on classic Tic Tac Toe!',
      image: '/images/TicTacToe.jpg',
      route: '/game/tictactoe',
    },
    {
      id: 'asteroids',
      title: 'Asteroids',
      description: 'The classic arcade game!',
      image: '/images/heavens.jpg',
      route: '/game/asteroids',
      disabled: false,
    },
    {
      id: 'connect 3',
      title: 'Connect 3',
      description: 'Is this really easier, come find out! (Coming Soon)',
      image: '/images/heavens1.jpg',
      route: '#',
      disabled: true,
    },
    {
      id: 'cribbage',
      title: 'Sprint Cribbage',
      description: 'Intrigued? This could be fun! (Coming Soon)',
      image: '/images/heavens2.jpg',
      route: '#',
      disabled: true,
    },
    {
      id: 'wrds',
      title: 'Wrds R Hrd',
      description: 'What even is this?! (Coming Soon)',
      image: '/images/heavens3.jpg',
      route: '#',
      disabled: true,
    },
  ];

  // Leaderboard state for Tic Tac Toe
  const [leaderboard, setLeaderboard] = useState({ easy: [], medium: [], hard: [] });
  const [asteroidsLeaderboard, setAsteroidsLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState("");

  useEffect(() => {
    // Fetch for Tic Tac Toe when a difficulty is selected
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
    // Fetch for Asteroids when expanded
    else if (expandedGame === 'asteroids') {
      setLoadingLeaderboard(true);
      setErrorLeaderboard("");
      const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
      fetch(`${apiBase}/api/leaderboard?gameType=Asteroids&limit=10`)
        .then(res => res.json())
        .then(data => {
          setAsteroidsLeaderboard(data.leaderboard || []);
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

  const handleGameClick = (e, game) => {
    if (game.disabled) {
      e.preventDefault();
      return;
    }

    const user = getStoredUser();
    if (!user) {
      e.preventDefault();
      setPendingRoute(game.route);
      setShowLoginPrompt(true);
    }
  };

  const handleLoginChoice = (shouldLogin) => {
    setShowLoginPrompt(false);
    if (shouldLogin) {
      navigate('/sign-in');
    } else if (pendingRoute) {
      navigate(pendingRoute);
    }
    setPendingRoute(null);
  };

  return (
    <div className="game-lobby">
      {showLoginPrompt && (
        <div className="login-prompt-overlay">
          <div className="login-prompt-modal">
            <h2>No Sign in Detected</h2>
            <p>Would you like to log in to track your progress and compete on the leaderboard?</p>
            <div className="login-prompt-buttons">
              <button className="login-btn" onClick={() => handleLoginChoice(true)}>
                Log In
              </button>
              <button className="continue-btn" onClick={() => handleLoginChoice(false)}>
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="game-lobby-container">
        <h1 className="game-lobby-title">Game Lobby</h1>
        <p className="game-lobby-subtitle">Select a game to play</p>
        
        <div className="games-grid">
          {games.map((game) => (
            <div key={game.id} className="game-card-wrapper">
              <Link
                id={game.id === 'asteroids' ? 'asteroids' : undefined}
                to={game.route}
                className={`game-card ${game.disabled ? 'disabled' : ''}`}
                onClick={(e) => handleGameClick(e, game)}
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
                {/* Tic Tac Toe: Show Difficulty Tabs */}
                {game.id === 'tictactoe' && (
                  <>
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
                    {expandedDifficulty && (
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
                  </>
                )}

                {/* Asteroids: Show leaderboard directly (no difficulty tabs) */}
                {game.id === 'asteroids' && (
                  loadingLeaderboard ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#fff' }}>Loading leaderboard...</div>
                  ) : errorLeaderboard ? (
                    <div style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>{errorLeaderboard}</div>
                  ) : (
                    <table className="leaderboard-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Player</th>
                          <th>High Score</th>
                          <th>Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asteroidsLeaderboard.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center' }}>No data yet</td></tr>
                        ) : asteroidsLeaderboard.map((entry) => (
                          <tr key={entry.rank}>
                            <td className="rank-badge">#{entry.rank}</td>
                            <td>{entry.player}</td>
                            <td>{entry.score}</td>
                            <td>{entry.level}</td>
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
