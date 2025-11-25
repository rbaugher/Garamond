import React, { useEffect, useState } from 'react';
import AsteroidsNavbar from '../../games/components/AsteroidsNavbar';
import AsteroidsApp from '../../games/asteroids/AsteroidsApp.jsx';
import './Game_Page.css';

export default function AsteroidsPage() {
  const [activeControl, setActiveControl] = useState(null);

  useEffect(() => {
    const mainNavbar = document.querySelector('.navbar');
    if (mainNavbar) mainNavbar.style.display = 'none';

    return () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) navbar.style.display = 'flex';
    };
  }, []);

  return (
    <div className="game-page-wrapper">
      <AsteroidsNavbar
        activeControl={activeControl}
        onControlChange={setActiveControl}
        onControlClose={() => setActiveControl(null)}
      />
      <div className="game-container">
        <AsteroidsApp
          activeControl={activeControl}
          onControlChange={setActiveControl}
          onControlClose={() => setActiveControl(null)}
        />
      </div>
    </div>
  );
}
