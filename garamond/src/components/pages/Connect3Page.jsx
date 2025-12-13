import React, { useEffect, useState } from 'react';
import GameNavbar from '../../games/components/GameNavbar';
import Connect3App from '../../games/connect3/Connect3App';
import { DifficultyProvider } from '../../games/components/context/DifficultyContext';
import { GameModeProvider } from '../../games/components/context/gamemodeContext';
import './Game_Page.css';

export default function Connect3Page() {
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
    <GameModeProvider>
      <DifficultyProvider>
        <div className="game-page-wrapper">
          <GameNavbar 
            title="Connect 3"
            activeControl={activeControl}
            onControlChange={setActiveControl}
            onControlClose={() => setActiveControl(null)}
          />
          <div className="game-container">
            <Connect3App />
          </div>
        </div>
      </DifficultyProvider>
    </GameModeProvider>
  );
}
