// src/pages/GamePage.jsx
import React, { useEffect, useState } from 'react';
import GameNavbar from '../../games/components/GameNavbar';
import TicTacToeApp from '../../games/App.jsx'; // Game's App.jsx imported from src/games/
import GamePageWrapper from '../GamePageWrapper';
import './Game_Page.css'; // Optional: CSS for Game Page

export default function GamePage() {
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
      <>
        <GameNavbar 
          title="Tic Tac Toe 2"
          activeControl={activeControl}
          onControlChange={setActiveControl}
          onControlClose={() => setActiveControl(null)}
        />
        <div className="game-page-wrapper">
          <div className="game-container">
            <TicTacToeApp 
              activeControl={activeControl}
              onControlChange={setActiveControl}
              onControlClose={() => setActiveControl(null)}
            />
          </div>
        </div>
      </>
    </GamePageWrapper>
  );
}