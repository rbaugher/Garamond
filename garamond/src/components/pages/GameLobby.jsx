import React, { useState } from 'react';
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
      title: 'Tic Tac Toe \u00B2',
      description: 'A strategic twist on classic Tic Tac Toe with numbered tiles.',
      image: '/images/img-1.jpg',
      route: '/game/tictactoe',
      leaderboards: {
        easy: [
          { rank: 1, player: 'RandomMaster', wins: 412, winRate: '88%' },
          { rank: 2, player: 'LuckyStrike', wins: 389, winRate: '86%' },
          { rank: 3, player: 'DiceRoller', wins: 356, winRate: '84%' },
          { rank: 4, player: 'ChanceSeeker', wins: 334, winRate: '81%' },
          { rank: 5, player: 'SimpleWinner', wins: 312, winRate: '79%' }
        ],
        medium: [
          { rank: 1, player: 'StrategyMaster', wins: 245, winRate: '87%' },
          { rank: 2, player: 'TileKing', wins: 198, winRate: '84%' },
          { rank: 3, player: 'LogicPro', wins: 156, winRate: '81%' },
          { rank: 4, player: 'GameWizard', wins: 142, winRate: '78%' },
          { rank: 5, player: 'SmartPlayer', wins: 128, winRate: '75%' }
        ],
        hard: [
          { rank: 1, player: 'AlphaBot', wins: 156, winRate: '92%' },
          { rank: 2, player: 'OmegaMind', wins: 134, winRate: '88%' },
          { rank: 3, player: 'CyberGhost', wins: 112, winRate: '85%' },
          { rank: 4, player: 'BrainBoss', wins: 98, winRate: '82%' },
          { rank: 5, player: 'MindBender', wins: 87, winRate: '79%' }
        ]
      }
    },
    {
      id: 'chess',
      title: 'Chess',
      description: 'The classic strategy game. (Coming Soon)',
      image: '/images/img-2.jpg',
      route: '#',
      disabled: true,
      leaderboards: {
        easy: [
          { rank: 1, player: 'PawnMover', wins: 456, winRate: '91%' },
          { rank: 2, player: 'BasicPlayer', wins: 423, winRate: '89%' },
          { rank: 3, player: 'BeginnerBliss', wins: 398, winRate: '87%' },
          { rank: 4, player: 'SimpleChess', wins: 367, winRate: '85%' },
          { rank: 5, player: 'EasyMode', wins: 345, winRate: '82%' }
        ],
        medium: [
          { rank: 1, player: 'ChessMaster', wins: 324, winRate: '88%' },
          { rank: 2, player: 'RookSlayer', wins: 287, winRate: '85%' },
          { rank: 3, player: 'PawnPusher', wins: 256, winRate: '83%' },
          { rank: 4, player: 'KnightNinja', wins: 198, winRate: '80%' },
          { rank: 5, player: 'QueenQuest', wins: 174, winRate: '78%' }
        ],
        hard: [
          { rank: 1, player: 'Kasparov2.0', wins: 198, winRate: '94%' },
          { rank: 2, player: 'DeepBlue', wins: 167, winRate: '91%' },
          { rank: 3, player: 'GrandMaster', wins: 145, winRate: '89%' },
          { rank: 4, player: 'CheckMate', wins: 123, winRate: '86%' },
          { rank: 5, player: 'SuperIQ', wins: 98, winRate: '83%' }
        ]
      }
    },
    {
      id: 'checkers',
      title: 'Checkers',
      description: 'Jump your way to victory. (Coming Soon)',
      image: '/images/heavens.jpg',
      route: '#',
      disabled: true,
      leaderboards: {
        easy: [
          { rank: 1, player: 'SimpleJumper', wins: 389, winRate: '90%' },
          { rank: 2, player: 'EasyHopper', wins: 356, winRate: '88%' },
          { rank: 3, player: 'BasicLeaper', wins: 334, winRate: '86%' },
          { rank: 4, player: 'JumpStart', wins: 312, winRate: '84%' },
          { rank: 5, player: 'BeginnerBounds', wins: 289, winRate: '81%' }
        ],
        medium: [
          { rank: 1, player: 'JumpMaster', wins: 189, winRate: '86%' },
          { rank: 2, player: 'KingJumper', wins: 167, winRate: '83%' },
          { rank: 3, player: 'CheckerPro', wins: 145, winRate: '81%' },
          { rank: 4, player: 'CrownHunter', wins: 123, winRate: '78%' },
          { rank: 5, player: 'BoardLord', wins: 98, winRate: '75%' }
        ],
        hard: [
          { rank: 1, player: 'CheckerGenius', wins: 134, winRate: '92%' },
          { rank: 2, player: 'CrownCollector', wins: 112, winRate: '89%' },
          { rank: 3, player: 'MasterJumper', wins: 98, winRate: '87%' },
          { rank: 4, player: 'StrategicLeap', wins: 87, winRate: '84%' },
          { rank: 5, player: 'EliteHopper', wins: 76, winRate: '81%' }
        ]
      }
    }
  ];

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
                {expandedDifficulty && (
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
                      {game.leaderboards[expandedDifficulty].map((entry) => (
                        <tr key={entry.rank}>
                          <td className="rank-badge">#{entry.rank}</td>
                          <td>{entry.player}</td>
                          <td>{entry.wins}</td>
                          <td>{entry.winRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
