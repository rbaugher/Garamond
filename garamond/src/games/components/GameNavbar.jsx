import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import GameModeControl from './navbar-controls/GameModeControl';
import DifficultyControl from './navbar-controls/DifficultyControl';
import MechanicsControl from './navbar-controls/MechanicsControl';
import SettingsControl from './navbar-controls/SettingsControl';
import StatsControl from './navbar-controls/StatsControl';
import { getStoredUser, clearStoredUser } from '../../utils/session';
import './GameNavbar.css';

function GameNavbar({ activeControl, onControlChange, onControlClose, title, controls, controlProps = {}, controlComponents = {}, user: userProp }) {
  const [click, setClick] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 960px)').matches);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

    // Load stored user (only if not provided via props)
    if (!userProp) {
      const stored = getStoredUser();
      if (stored) setUser(stored);
    } else {
      setUser(userProp);
    }

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
  }, [userProp]);

  // Close the menu when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // update the page title when a title prop is provided; restore previous title on unmount
  useEffect(() => {
    if (!title) return undefined;
    if (typeof document === 'undefined') return undefined;
    const previous = document.title;
    document.title = title;
    return () => { document.title = previous; };
  }, [title]);

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
        
        {title ? (
          <h1 className="game-title">{title}</h1>
        ) : (
          <h1 className="game-title">Tic Tac Toe <sup>2</sup></h1>
        )}

        {/* document.title is handled in the effect above */}

        {/* Desktop Game Controls */}
        {!isMobile && (
          <div className="game-controls">
            { (controls || ['gamemode','difficulty','mechanics','stats']).map((c) => {
              const Comp = controlComponents[c] || ({
                gamemode: GameModeControl,
                difficulty: DifficultyControl,
                mechanics: MechanicsControl,
                settings: SettingsControl,
                stats: StatsControl
              })[c];
              const props = controlProps[c] || {};
              if (!Comp) return null;
              return (
                <Comp
                  key={c}
                  active={activeControl === c}
                  onToggle={() => handleControlClick(c)}
                  {...props}
                />
              );
            })}
          </div>
        )}

        {/* Mobile Icon Controls (horizontal row) */}
        {isMobile && (
          <div className="game-controls-mobile">
            { (controls || ['gamemode','difficulty','mechanics','stats']).map((c) => {
              const Comp = controlComponents[c] || ({
                gamemode: GameModeControl,
                difficulty: DifficultyControl,
                mechanics: MechanicsControl,
                settings: SettingsControl,
                stats: StatsControl
              })[c];
              const props = controlProps[c] || {};
              if (!Comp) return null;
              return (
                <Comp
                  key={`mobile-icon-${c}`}
                  id={`${c}-mobile-icon`}
                  size="small"
                  variant="text"
                  active={activeControl === c}
                  onToggle={() => handleControlClick(c)}
                  iconOnly
                  {...props}
                />
              );
            })}
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
          { (controls || ['gamemode','difficulty','mechanics','stats']).map((c) => {
            const Comp = controlComponents[c] || ({
              gamemode: GameModeControl,
              difficulty: DifficultyControl,
              mechanics: MechanicsControl,
              settings: SettingsControl,
              stats: StatsControl
            })[c];
            const props = controlProps[c] || {};
            if (!Comp) return null;
            return (
              <li className="game-nav-item" key={`mobile-${c}`}>
                <Comp
                  id={`${c}-mobile`}
                  size="small"
                  variant="text"
                  fullWidth
                  active={activeControl === c}
                  onToggle={() => handleControlClick(c)}
                  {...props}
                />
              </li>
            );
          })}
          <li className="game-nav-divider" />
          <li className="game-nav-item">
            <Link to="/" className="game-nav-link" onClick={closeMobileMenu}>
              <ArrowBackIcon fontSize="small" />
              Home
            </Link>
          </li>
          <li className="game-nav-item">
            <Link to="/sign-up" className="game-nav-link" onClick={closeMobileMenu}>
              <ArrowBackIcon fontSize="small" />
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default GameNavbar;
