import React, { useState, useEffect } from 'react';

function StarterPopout({ turn, moveCount, winner }) {
  const [showStarter, setShowStarter] = useState(true);
  const [fadeStarter, setFadeStarter] = useState(false);
  const [settleStarter, setSettleStarter] = useState(false);
  const [starter, setStarter] = useState(turn);

  useEffect(() => {
    if (winner.player === null && moveCount === 0) {
      setStarter(turn);
      setShowStarter(true);
      setFadeStarter(false);
      setSettleStarter(false);
    }
  }, [winner.player, moveCount, turn]);

  useEffect(() => {
    if (showStarter) {
      const settleTimer = setTimeout(() => setSettleStarter(true), 300);
      const fadeTimer = setTimeout(() => setFadeStarter(true), 1300);
      const hideTimer = setTimeout(() => setShowStarter(false), 2000);
      return () => {
        clearTimeout(settleTimer);
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showStarter]);

  return (
    showStarter && (
      <div className={`starter-popout${settleStarter ? ' settle' : ''}${fadeStarter ? ' fade-out' : ''}`}>
        First player: <span style={{ color: starter === 'X' ? '#09C372' : '#498AFB' }}>{starter}</span>
      </div>
    )
  );
}

export default StarterPopout;
