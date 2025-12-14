// src/pages/TicTacToePage.jsx
import React, { useEffect, useState } from 'react';
import GameNavbar from '../../games/components/GameNavbar';
import TicTacToeApp from '../../games/App.jsx'; // Game's App.jsx imported from src/games/
import GamePageWrapper from '../GamePageWrapper';
import { useGameMode } from '../../games/components/context/gamemodeContext';
import './Game_Page.css'; // Optional: CSS for Game Page

export default function TicTacToePage() {
  const [activeControl, setActiveControl] = useState(null);

  useEffect(() => {
    // Hide main navbar when on game page
    const mainNavbar = document.querySelector('.navbar');
    if (mainNavbar) {
      mainNavbar.style.display = 'none';
    }

    // Cleanup: show navbar when leaving game page
    return () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.style.display = 'flex';
      }
    };
  }, []);

  return (
    <GamePageWrapper>
      <InnerGamePage activeControl={activeControl} setActiveControl={setActiveControl} />
    </GamePageWrapper>
  );
}

function InnerGamePage({ activeControl, setActiveControl }) {
  // read contexts here and pass control choices to the shared navbar
  const { gamemode } = useGameMode();
  // Show difficulty only in single-player mode (gamemode !== 1)
  const controls = gamemode === 1 ? [ 'mechanics', 'stats' ] : [ 'gamemode', 'difficulty', 'mechanics', 'stats' ];

  return (
    <div className="game-page-wrapper">
      <GameNavbar
        title="Tic Tac Toe 2"
        controls={controls}
        activeControl={activeControl}
        onControlChange={setActiveControl}
        onControlClose={() => setActiveControl(null)}
      />
      <div className="game-container">
        <TicTacToeApp
          activeControl={activeControl}
          onControlChange={setActiveControl}
          onControlClose={() => setActiveControl(null)}
        />
      </div>
    </div>
  );
}
