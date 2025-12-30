import React, { createContext, useContext } from 'react';
import { useConnect7 } from '../hooks/useConnect7';
import { useGameMode } from '../../components/context/gamemodeContext';
import { useDifficulty } from '../../components/context/DifficultyContext';

const Connect7Context = createContext(null);

export function Connect7Provider({ children }) {
  const { gamemode } = useGameMode();
  const { difficulty } = useDifficulty();
  const value = useConnect7({ gamemode, difficulty });
  return (
    <Connect7Context.Provider value={value}>{children}</Connect7Context.Provider>
  );
}

export function useConnect7Context() {
  const ctx = useContext(Connect7Context);
  if (!ctx) throw new Error('useConnect7Context must be used within Connect7Provider');
  return ctx;
}
