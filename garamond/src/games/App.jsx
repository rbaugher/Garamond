import { useEffect, useState } from 'react'
import './App.css'
import TicTacToe from './components/TicTacToe'
import Board, { TurnContext, WinnerContext, MoveCountContext } from './components/Board'
import GameControls from './components/GameControls'
import { DifficultyProvider } from './components/context/DifficultyContext'
import { GameModeProvider } from './components/context/gamemodeContext'


function App({ activeControl, onControlChange, onControlClose }) {
  // Randomly determine who goes first (X or O) on initial render
  const [turn, setTurn] = useState(() => (Math.random() < 0.5 ? 'X' : 'O'));
  const [winner, setWinner] = useState({player: null, winningTiles: []});
  const [moveCount, setMoveCount] = useState(0);
  const [starter, setStarter] = useState(turn); // Track who was chosen to start
  const [showStarter, setShowStarter] = useState(true);
  const [fadeStarter, setFadeStarter] = useState(false);
  const [settleStarter, setSettleStarter] = useState(false);
  const [mode, setMode] = useState(0); //'singleplayer' or 'multiplayer' 

  useEffect(() => {
    if (showStarter) {
      const settleTimer = setTimeout(() => setSettleStarter(true), 300); // Move to middle after 0.3s
      const fadeTimer = setTimeout(() => setFadeStarter(true), 1300); // Start fade after 4s (was 2s)
      const hideTimer = setTimeout(() => setShowStarter(false), 2000); // Hide after 6s (was 3s)
      return () => {
        clearTimeout(settleTimer);
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showStarter]);

  useEffect(() => {
    if (winner.player === null && moveCount === 0) {
      setStarter(turn); // Ensure starter matches the new turn
      setShowStarter(true);
      setFadeStarter(false);
      setSettleStarter(false);
    }
  }, [winner, turn, moveCount]);

  return (
    <GameModeProvider value={{ mode, setMode }}>
      <DifficultyProvider>
        <WinnerContext.Provider value={{ winner, setWinner}}>
          <TurnContext.Provider value={{ turn, setTurn }}>
            <MoveCountContext.Provider value={{ moveCount, setMoveCount }}>
            <main className="background">
              {showStarter && (
                <div className={`starter-popout${settleStarter ? ' settle' : ''}${fadeStarter ? ' fade-out' : ''}`}>
                  First player: <span style={{ color: starter === 'X' ? '#09C372' : '#498AFB' }}>{starter}</span>
                </div>
              )}
              <GameControls activeControl={activeControl} onClose={onControlClose} />
              <TicTacToe winner={winner} mode={mode}/>
              <Board turn={turn} setTurn={setTurn} winner={winner} setWinner={setWinner} mode={mode} setMode={setMode}/>
            </main>
            </MoveCountContext.Provider>
          </TurnContext.Provider>
        </WinnerContext.Provider> 
      </DifficultyProvider>
    </GameModeProvider>
  );
}

export default App
