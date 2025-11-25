import React, { useEffect, useState } from 'react';
import AsteroidsNavbar from '../../games/components/AsteroidsNavbar';
import AsteroidsApp from '../../games/asteroids/AsteroidsApp.jsx';
import AsteroidsSettings from '../../games/asteroids/AsteroidsSettings.jsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './Game_Page.css';

export default function AsteroidsPage() {
  const [activeControl, setActiveControl] = useState(null);
  const [settings, setSettings] = useState({
    shipColor: '#F6D55C',
    backgroundColor: '#071019',
    shipShape: 'triangle'
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState("");
  const [topScore, setTopScore] = useState({ score: 0, player: '' });

  useEffect(() => {
    const mainNavbar = document.querySelector('.navbar');
    if (mainNavbar) mainNavbar.style.display = 'none';

    return () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) navbar.style.display = 'flex';
    };
  }, []);

  // Fetch top score on component mount and when game ends
  const fetchTopScore = () => {
    const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
    console.log("Fetching top score from:", `${apiBase}/api/leaderboard?gameType=Asteroids&limit=1`);
    fetch(`${apiBase}/api/leaderboard?gameType=Asteroids&limit=1`)
      .then(res => res.json())
      .then(data => {
        console.log("Received top score data:", data);
        if (data.leaderboard && data.leaderboard.length > 0) {
          setTopScore({
            score: data.leaderboard[0].score,
            player: data.leaderboard[0].player
          });
          console.log("Top score updated:", data.leaderboard[0]);
        } else {
          console.log("No top score found in leaderboard data");
        }
      })
      .catch(err => {
        console.error("Failed to fetch top score:", err);
      });
  };

  useEffect(() => {
    fetchTopScore();

    // Listen for game end event to refresh top score
    const handleGameEnd = () => {
      console.log("Game ended, refreshing top score...");
      setTimeout(fetchTopScore, 500); // Small delay to ensure DB write completes
    };

    window.addEventListener('asteroidsGameEnded', handleGameEnd);

    return () => {
      window.removeEventListener('asteroidsGameEnded', handleGameEnd);
    };
  }, []);

  useEffect(() => {
    if (showLeaderboard) {
      setLoadingLeaderboard(true);
      setErrorLeaderboard("");
      const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
      fetch(`${apiBase}/api/leaderboard?gameType=Asteroids&limit=10`)
        .then(res => res.json())
        .then(data => {
          setLeaderboard(data.leaderboard || []);
          // Also update top score when leaderboard is opened
          if (data.leaderboard && data.leaderboard.length > 0) {
            setTopScore({
              score: data.leaderboard[0].score,
              player: data.leaderboard[0].player
            });
          }
          setLoadingLeaderboard(false);
        })
        .catch(err => {
          setErrorLeaderboard("Failed to load leaderboard");
          setLoadingLeaderboard(false);
        });
    }
  }, [showLeaderboard]);

  return (
    <div className="game-page-wrapper">
      <AsteroidsNavbar
        activeControl={activeControl}
        onControlChange={setActiveControl}
        onControlClose={() => setActiveControl(null)}
      />
      <div className="game-container">
        <AsteroidsApp
          activeControl={activeControl}
          onControlChange={setActiveControl}
          onControlClose={() => setActiveControl(null)}
          settings={settings}
          topScore={topScore}
        />
      </div>
      
      {/* Leaderboard Dropdown */}
      <div className="asteroids-leaderboard-container">
        <button
          className={`leaderboard-toggle ${showLeaderboard ? 'expanded' : ''}`}
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          aria-expanded={showLeaderboard}
          aria-label="Toggle Asteroids leaderboard"
        >
          <span>Leaderboard</span>
          {showLeaderboard ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>

        <div className={`leaderboard ${showLeaderboard ? 'expanded' : ''}`}>
          {loadingLeaderboard ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#fff' }}>Loading leaderboard...</div>
          ) : errorLeaderboard ? (
            <div style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>{errorLeaderboard}</div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>High Score</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>No data yet</td></tr>
                ) : leaderboard.map((entry) => (
                  <tr key={entry.rank}>
                    <td className="rank-badge">#{entry.rank}</td>
                    <td>{entry.player}</td>
                    <td>{entry.score}</td>
                    <td>{entry.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {activeControl === 'mechanics' && (
        <AsteroidsSettings
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setActiveControl(null)}
        />
      )}
    </div>
  );
}
