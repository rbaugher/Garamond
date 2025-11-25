import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Button from '@mui/material/Button';
import './GameNavbar.css';

function AsteroidsNavbar({ activeControl, onControlChange, onControlClose }) {
  const [click, setClick] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 960px)').matches);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  useEffect(() => {
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
        
        <h1 className="game-title">Asteroids</h1>

        {/* Desktop Game Controls */}
        {!isMobile && (
          <div className="game-controls">
            <Button
              id='mechanics'
              size="small"
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => handleControlClick('mechanics')}
              className="control-button"
            >
              Settings
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
              id='mechanics-mobile'
              size="small"
              variant="text"
              startIcon={<SettingsIcon />}
              onClick={() => handleControlClick('mechanics')}
              fullWidth
              className="mobile-control-button"
            >
              Settings
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

export default AsteroidsNavbar;
