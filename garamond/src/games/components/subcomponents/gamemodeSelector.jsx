import React, { useState, useEffect } from 'react';
import './gamemodeSelector.css';

function GameMode({ level, onChange, onFadeComplete }) {
    const [fade, setFade] = useState(false);
    const [removed, setRemoved] = useState(false);
    
    useEffect(() => {
        if (fade) {
            const timer = setTimeout(() => {
                setRemoved(true);
                if (onFadeComplete) onFadeComplete();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [fade, onFadeComplete]);
    
    const handleChange = (value) => {
        onChange(value);
        setFade(true);
    };
    
    if (removed) return null;
    
    return (
        <div className={`gamemodeselector${fade ? ' fade-out' : ''}`}>
            <div className="gamemode-container">
                <h3 className="gamemode-title">Select Game Mode</h3>
                
                <div className="gamemode-toggle-group">
                    <button
                        className={`gamemode-option ${level === 0 ? 'active' : ''}`}
                        onClick={() => handleChange(0)}
                    >
                        <div className="gamemode-icon">👤</div>
                        <div className="gamemode-label">Single Player</div>
                        <div className="gamemode-desc">Play against AI</div>
                    </button>
                    
                    <button
                        className={`gamemode-option ${level === 1 ? 'active' : ''}`}
                        onClick={() => handleChange(1)}
                    >
                        <div className="gamemode-icon">👥</div>
                        <div className="gamemode-label">Multiplayer</div>
                        <div className="gamemode-desc">Play with a friend</div>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameMode;
