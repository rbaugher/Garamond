import React, { useState } from 'react';
import SubSettings from "./subcomponents/subSettings.jsx";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Button from '@mui/material/Button';
import Difficulty from './subcomponents/difficultySlider.jsx';
import { useDifficulty } from './context/DifficultyContext.jsx';
import { useGameMode } from './context/gamemodeContext.jsx';
import GameMode from './subcomponents/gamemodeSelector.jsx';
import SmartToyIcon from '@mui/icons-material/SmartToy';

function Settings() {
    const [active, setActive] = React.useState(false);
    const [selected, setSelected] = React.useState(null);
    const { difficulty, setDifficulty } = useDifficulty();
    const { gamemode, setGameMode } = useGameMode();

    // Custom handler to toggle menu and hide all sub-menus
    const handleMenuToggle = () => {
        setActive(prev => !prev);
        setSelected(null);
    };

    // Detect mobile device (max-width: 600px)
    const [isMobile, setIsMobile] = React.useState(() => window.matchMedia('(max-width: 600px)').matches);
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 600px)');
        const handler = (e) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return (
        <>
        <section className="settings">
            <SubSettings active={active} setActive={handleMenuToggle} />
            <div className={active ? 'NavBar' : 'NavBar active'}>
                {!isMobile && (
                  <div className='NavBaritems'>
                      <Button
                          id='gamemode'
                          size="large"
                          variant="outlined"
                          startIcon={<SmartToyIcon />}
                          onClick={() => setSelected('gamemode')}
                      >
                          Game Mode
                      </Button>
                  </div>
                )}
                {gamemode !== 1 && (
                  <div className='NavBaritems'>
                      <Button
                          id='difficulty'
                          size="large"
                          variant="outlined"
                          startIcon={<FitnessCenterIcon />}
                          onClick={() => setSelected('difficulty')}
                      >
                          Difficulty
                      </Button>
                  </div>
                )}
                <div className='NavBaritems'>
                    <Button
                        id='mechanics'
                        size="large"
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => setSelected('mechanics')}
                    >
                        Game Mechanics
                    </Button>
                </div>
                <div className='NavBaritems'>
                    <Button
                        id='stats'
                        size="large"
                        variant="outlined"
                        startIcon={<QueryStatsIcon />}
                        onClick={() => setSelected('stats')}
                    >
                        Stats
                    </Button>
                </div>
            </div>
        </section>
            {selected === 'difficulty' && (
                <div>
                    <Difficulty level={difficulty} onChange={setDifficulty} />
                </div>
            )}
            {/* Render game engine slider bars below NavBar container */}
            {selected === 'mechanics' && (
                <div>
                    <div className='mechanics'>
                        Tic Tac Toe Squared is played on a traditional 3x3 grid with identical winning conditions to the game you know and love. Get 3 in a row in any direction to win! Easy as that. The catch... all of the 9 squares are fair game as long as you have a higher number than what currenly occupies the square! Yeah, it's a bit more complicated now. Do your worst!!
                    </div>
                </div>
            )}
            {/* Render game mode selector below NavBar container */}
            {selected === 'gamemode' && (
                <div>
                    <GameMode 
                        level={gamemode} 
                        onChange={setGameMode}
                        onFadeComplete={() => setSelected(null)}
                    />
                </div>
            )}

            {/* {selected === 'mechanics' && (
                <div className='mechanicsSlider'>
                    <Mechanics level={difficulty} onChange={setScale} />
                </div>
            )} */}

        </>
    );
}
export default Settings;