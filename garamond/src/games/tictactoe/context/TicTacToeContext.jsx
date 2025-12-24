import React, { createContext, useContext } from 'react';
import { useTicTacToe } from '../hooks/useTicTacToe';
import { useGameMode } from '../../components/context/gamemodeContext';
import { useDifficulty } from '../../components/context/DifficultyContext';

const TicTacToeContext = createContext(null);

export function TicTacToeProvider({ children }) {
  const { gamemode } = useGameMode();
  const { difficulty } = useDifficulty();
  const value = useTicTacToe({ gamemode, difficulty });
  return (
    <TicTacToeContext.Provider value={value}>{children}</TicTacToeContext.Provider>
  );
}

export function useTicTacToeContext() {
  const ctx = useContext(TicTacToeContext);
  if (!ctx) throw new Error('useTicTacToeContext must be used within TicTacToeProvider');
  return ctx;
}
