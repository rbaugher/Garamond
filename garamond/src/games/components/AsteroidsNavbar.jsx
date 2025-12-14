import React from 'react';
import GameNavbar from './GameNavbar';

export default function AsteroidsNavbar(props) {
  // Thin wrapper: specify Asteroids-specific controls and title
  return (
    <GameNavbar
      title="Asteroids"
      controls={[ 'settings', 'stats' ]}
      {...props}
    />
  );
}
