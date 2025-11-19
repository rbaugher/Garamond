//App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import Statistics from './components/pages/Statistics';
import SignUp from './components/pages/SignUp';
import GameLobby from './components/pages/GameLobby';
import TicTacToePage from './components/pages/TicTacToePage';


function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/game" element={<GameLobby />} />
        <Route path="/game/tictactoe" element={<TicTacToePage />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;

