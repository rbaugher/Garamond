import React, { createContext, useContext } from 'react';
import { useConnect10 } from '../hooks/useConnect10';
import { useGameMode } from '../../components/context/gamemodeContext';
import { useDifficulty } from '../../components/context/DifficultyContext';

const Connect10Context = createContext(null);

export function Connect10Provider({ children }) {
  const { gamemode } = useGameMode();
  const { difficulty } = useDifficulty();
  const value = useConnect10({ gamemode, difficulty });
  return (
    <Connect10Context.Provider value={value}>{children}</Connect10Context.Provider>
  );
}

export function useConnect10Context() {
  const ctx = useContext(Connect10Context);
  if (!ctx) throw new Error('useConnect10Context must be used within Connect10Provider');
  return ctx;
}
