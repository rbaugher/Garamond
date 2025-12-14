import React from 'react';
import { GameModeProvider } from '../games/components/context/gamemodeContext';
import { DifficultyProvider } from '../games/components/context/DifficultyContext';

export default function GamePageWrapper({ children }) {
  return (
    <GameModeProvider>
      <DifficultyProvider>
        {children}
      </DifficultyProvider>
    </GameModeProvider>
  );
}
