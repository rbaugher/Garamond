import './App.css'
import TicTacToe from './tictactoe/TicTacToe'
import GameControls from './components/GameControls'
import { DifficultyProvider } from './components/context/DifficultyContext'
import { GameModeProvider } from './components/context/gamemodeContext'

function App({ activeControl, onControlChange, onControlClose }) {
  return (
    <GameModeProvider>
      <DifficultyProvider>
        <main className="background">
          <GameControls activeControl={activeControl} onClose={onControlClose} />
          <TicTacToe />
        </main>
      </DifficultyProvider>
    </GameModeProvider>
  );
}

export default App
