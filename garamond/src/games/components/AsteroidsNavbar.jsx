import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Button from '@mui/material/Button';
import { getStoredUser, clearStoredUser } from '../../utils/session';
import './GameNavbar.css';

function AsteroidsNavbar({ activeControl, onControlChange, onControlClose }) {
  const [click, setClick] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 960px)').matches);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

    // Load stored user
    const stored = getStoredUser();
    if (stored) setUser(stored);

    // Listen for sign-up and sign-out events
    const handleUserSignedUp = (event) => setUser(event.detail);
    const handleUserSignedOut = () => setUser(null);
    window.addEventListener('userSignedUp', handleUserSignedUp);
    window.addEventListener('userSignedOut', handleUserSignedOut);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('userSignedUp', handleUserSignedUp);
      window.removeEventListener('userSignedOut', handleUserSignedOut);
    };
  }, []);

  // Close the menu when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleControlClick = (controlType) => {
    onControlChange(activeControl === controlType ? null : controlType);
    closeMobileMenu();
  };

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    setMenuOpen(false);
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

        {/* User Profile */}
        {!isMobile && user && (
          <div className="user-avatar" title={user.nickname || user.name} ref={menuRef}>
            <button className="avatar-button" onClick={() => setMenuOpen(!menuOpen)} aria-haspopup="true" aria-expanded={menuOpen}>
              <span className="avatar-emoji">{user.avatar}</span>
              <span className="user-name">{user.nickname || user.name}</span>
            </button>
            {menuOpen && (
              <div className="user-menu" role="menu">
                <Link to="/profile" className="user-menu-item" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button className="user-menu-item" onClick={handleLogout}>Logout</button>
              </div>
            )}
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
