import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button'; // Ensure this component exists
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { getStoredUser, clearStoredUser } from '../utils/session';

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith('/game');
  const menuRef = useRef(null);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
    window.addEventListener('resize', showButton);
    
    // Read stored user via helper
    const stored = getStoredUser();
    if (stored) setUser(stored);

    // Listen for sign-up and sign-out events
    const handleUserSignedUp = (event) => setUser(event.detail);
    const handleUserSignedOut = () => setUser(null);
    window.addEventListener('userSignedUp', handleUserSignedUp);
    window.addEventListener('userSignedOut', handleUserSignedOut);
    
    return () => {
      window.removeEventListener('resize', showButton);
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

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    setMenuOpen(false);
  };

  // Calculate contrasting text color based on background
  const getContrastColor = (hexColor) => {
    if (!hexColor) return '#fff';
    
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000' : '#fff';
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          GARAMOND
          <i className="fab fa-typo3" aria-hidden="true" />
        </Link>
        <button
          className="menu-icon"
          onClick={handleClick}
          aria-label={click ? 'Close menu' : 'Open menu'}
        >
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} aria-hidden="true" />
        </button>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          {!isGameRoute && (
            <>
              <li className="nav-item">
                <Link to="/game" className="nav-links" onClick={closeMobileMenu}>
                  Game Page
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              to="/sign-in"
              className="nav-links-mobile"
              onClick={closeMobileMenu}
            >
              Player Login
            </Link>
          </li>
        </ul>
        {button && (
          user ? (
            <div 
              className="user-avatar" 
              title={user.nickname || user.name} 
              ref={menuRef}
              style={{ backgroundColor: user.preferredColor || '#508465' }}
            >
              <button className="avatar-button" onClick={() => setMenuOpen(!menuOpen)} aria-haspopup="true" aria-expanded={menuOpen}>
                <span className="avatar-emoji">{user.avatar}</span>
                <span 
                  className="user-name"
                  style={{ color: getContrastColor(user.preferredColor || '#508465') }}
                >
                  {user.nickname || user.name}
                </span>
              </button>
              {menuOpen && (
                <div className="user-menu" role="menu">
                  <Link to="/profile" className="user-menu-item" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button className="user-menu-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Button buttonStyle="btn--outline" to="/sign-in">Player Login</Button>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;
