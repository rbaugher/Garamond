import React, { createContext, useContext, useState } from 'react';

export const marks = [
  { value: 0, label: 'Easy' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'Hard' },
];

const DifficultyContext = createContext();

export function DifficultyProvider({ children }) {
  const [difficulty, setDifficulty] = useState(1); // default to Medium
  const label = marks.find(mark => mark.value === difficulty)?.label || '';

  return (
    <DifficultyContext.Provider value={{ difficulty, setDifficulty, label }}>
      {children}
    </DifficultyContext.Provider>
  );
}

export function useDifficulty() {
  return useContext(DifficultyContext);
}
