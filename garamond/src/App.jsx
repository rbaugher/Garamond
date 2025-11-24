//App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import Summit from './components/pages/Summit_Adventure';
import Rainier from './components/pages/Summit_Adventure/Rainier';
import Hobbies from './components/pages/Hobbies';
import Outdoors from './components/pages/Outdoors';
import SignIn from './components/pages/SignIn';
import SignUp from './components/pages/SignUp';
import Profile from './components/pages/Profile';
import GameLobby from './components/pages/GameLobby';
import TicTacToePage from './components/pages/TicTacToePage';


function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/summit_adventure" element={<Summit />} />
  <Route path="/summit_adventure/rainier" element={<Rainier />} />
  <Route path="/hobbies" element={<Hobbies />} />
    <Route path="/outdoors" element={<Outdoors />} />
        <Route path="/game" element={<GameLobby />} />
        <Route path="/game/tictactoe" element={<TicTacToePage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;

