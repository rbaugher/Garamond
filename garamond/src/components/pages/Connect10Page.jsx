import React, { useEffect, useState } from 'react';
import GameNavbar from '../../games/components/GameNavbar';
import Connect10App from '../../games/connect10/Connect10App';
import GamePageWrapper from '../GamePageWrapper';
import { useGameMode } from '../../games/components/context/gamemodeContext';
import './Game_Page.css';

export default function Connect10Page() {
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
    <GamePageWrapper>
      <InnerConnect10 activeControl={activeControl} setActiveControl={setActiveControl} />
    </GamePageWrapper>
  );
}

function InnerConnect10({ activeControl, setActiveControl }) {
  const { gamemode } = useGameMode();
  const controls = gamemode === 1 ? [ 'mechanics', 'stats' ] : [ 'gamemode', 'difficulty', 'mechanics', 'stats' ];

  return (
    <div className="game-page-wrapper">
      <GameNavbar
        title="Reactor Control"
        controls={controls}
        activeControl={activeControl}
        onControlChange={setActiveControl}
        onControlClose={() => setActiveControl(null)}
      />
      <div className="game-container">
        <Connect10App />
      </div>
    </div>
  );
}
