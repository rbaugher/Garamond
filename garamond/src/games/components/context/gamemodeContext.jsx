import React, { createContext, useContext, useState } from 'react';

export const marks = [
  { value: 0, label: 'Single Player' },
  { value: 1, label: 'Multiplayer' },
];

const GameModeContext = createContext();

export function GameModeProvider({ children }) {
  const [gamemode, setGameMode] = useState(0); // default to SinglePlayer
  const label = marks.find(mark => mark.value === gamemode)?.label || '';

  return (
    <GameModeContext.Provider value={{ gamemode, setGameMode, label }}>
      {children}
    </GameModeContext.Provider>
  );
}

export function useGameMode() {
  return useContext(GameModeContext);
}
