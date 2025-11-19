import React, { useState, useEffect } from 'react';
import { Button } from './Button'; // Ensure this component exists
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith('/game');

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
    
    // Check localStorage for user data
    const savedUser = localStorage.getItem('garamondUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
    
    // Listen for sign-up event
    const handleUserSignedUp = (event) => {
      setUser(event.detail);
    };
    window.addEventListener('userSignedUp', handleUserSignedUp);
    
    return () => {
      window.removeEventListener('resize', showButton);
      window.removeEventListener('userSignedUp', handleUserSignedUp);
    };
  }, []);

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
                <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/services" className="nav-links" onClick={closeMobileMenu}>
                  Statistics
                </Link>
              </li>
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
            <div className="user-avatar" title={user.name}>
              <span className="avatar-emoji">{user.avatar}</span>
              <span className="user-name">{user.name}</span>
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