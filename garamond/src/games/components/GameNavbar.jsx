import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Button from '@mui/material/Button';
import { useDifficulty } from './context/DifficultyContext';
import { useGameMode } from './context/gamemodeContext';
import './GameNavbar.css';

function GameNavbar({ activeControl, onControlChange, onControlClose }) {
  const [click, setClick] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 960px)').matches);
  const { gamemode } = useGameMode();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  useEffect(() => {
    // Close menu when window resizes
    const handleResize = () => {
      if (window.innerWidth > 960) {
        setClick(false);
      }
      setIsMobile(window.innerWidth <= 960);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleControlClick = (controlType) => {
    onControlChange(activeControl === controlType ? null : controlType);
    closeMobileMenu();
  };

  return (
    <nav className="game-navbar" role="navigation" aria-label="Game navigation">
      <div className="game-navbar-container">
        <Link to="/game" className="game-navbar-logo" onClick={closeMobileMenu}>
          <ArrowBackIcon className="back-icon" />
          <span>Back to Lobby</span>
        </Link>
        
        <h1 className="game-title">Tic Tac Toe <sup>2</sup></h1>

        {/* Desktop Game Controls */}
        {!isMobile && (
          <div className="game-controls">
            <Button
              id='gamemode'
              size="small"
              variant="outlined"
              startIcon={<SmartToyIcon />}
              onClick={() => handleControlClick('gamemode')}
              className="control-button"
            >
              Game Mode
            </Button>
            {gamemode !== 1 && (
              <Button
                id='difficulty'
                size="small"
                variant="outlined"
                startIcon={<FitnessCenterIcon />}
                onClick={() => handleControlClick('difficulty')}
                className="control-button"
              >
                Difficulty
              </Button>
            )}
            <Button
              id='mechanics'
              size="small"
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => handleControlClick('mechanics')}
              className="control-button"
            >
              Mechanics
            </Button>
            <Button
              id='stats'
              size="small"
              variant="outlined"
              startIcon={<QueryStatsIcon />}
              onClick={() => handleControlClick('stats')}
              className="control-button"
            >
              Stats
            </Button>
          </div>
        )}
        
        <button
          className="game-menu-icon"
          onClick={handleClick}
          aria-label={click ? 'Close menu' : 'Open menu'}
        >
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} aria-hidden="true" />
        </button>

        <ul className={click ? 'game-nav-menu active' : 'game-nav-menu'}>
          <li className="game-nav-item">
            <Button
              id='gamemode-mobile'
              size="small"
              variant="text"
              startIcon={<SmartToyIcon />}
              onClick={() => handleControlClick('gamemode')}
              fullWidth
              className="mobile-control-button"
            >
              Game Mode
            </Button>
          </li>
          {gamemode !== 1 && (
            <li className="game-nav-item">
              <Button
                id='difficulty-mobile'
                size="small"
                variant="text"
                startIcon={<FitnessCenterIcon />}
                onClick={() => handleControlClick('difficulty')}
                fullWidth
                className="mobile-control-button"
              >
                Difficulty
              </Button>
            </li>
          )}
          <li className="game-nav-item">
            <Button
              id='mechanics-mobile'
              size="small"
              variant="text"
              startIcon={<SettingsIcon />}
              onClick={() => handleControlClick('mechanics')}
              fullWidth
              className="mobile-control-button"
            >
              Mechanics
            </Button>
          </li>
          <li className="game-nav-item">
            <Button
              id='stats-mobile'
              size="small"
              variant="text"
              startIcon={<QueryStatsIcon />}
              onClick={() => handleControlClick('stats')}
              fullWidth
              className="mobile-control-button"
            >
              Stats
            </Button>
          </li>
          <li className="game-nav-divider" />
          <li className="game-nav-item">
            <Link to="/" className="game-nav-link" onClick={closeMobileMenu}>
              <ArrowBackIcon fontSize="small" />
              Home
            </Link>
          </li>
          <li className="game-nav-item">
            <Link to="/statistics" className="game-nav-link" onClick={closeMobileMenu}>
              Statistics
            </Link>
          </li>
          <li className="game-nav-item">
            <Link to="/sign-up" className="game-nav-link" onClick={closeMobileMenu}>
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default GameNavbar;
