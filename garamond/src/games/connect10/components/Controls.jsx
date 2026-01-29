import React from 'react';

export default function Controls({ onClick }) {
  return (
    <button className="reset-button" onClick={onClick}>
      Reset Game
    </button>
  );
}
