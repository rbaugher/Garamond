import React, { useState, useEffect } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { marks } from '../context/DifficultyContext';

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
    const handleChange = (_, value) => {
        onChange(Number(value));
        setFade(true);
    };
    if (removed) return null;
    return (
        <div className={`gamemodeselector${fade ? ' fade-out' : ''}`}>
            <FormControl>
                <FormLabel id="gamemode-radio-buttons-group-label" sx={{ color: 'lightgray', fontFamily: 'Itim', fontSize: '20px' }}>Game Mode</FormLabel>
                <RadioGroup
                    aria-labelledby="gamemode-radio-buttons-group"
                    name="gamemode-radio-buttons-group"
                    value={level}
                    onChange={handleChange}
                    sx={{
                        border: '2px solid #9c76e4',
                        borderRadius: '10px',
                        padding: '12px',
                    }}
                >
                        <FormControlLabel 
                            value={0} 
                            control={<Radio sx={{ color: 'lightgray', '&.Mui-checked': { color: '#9c76e4ff' } }} />} 
                            label="Single Player" 
                            sx={{ 
                                '.MuiFormControlLabel-label': { 
                                    backgroundColor: '#9c76e4', 
                                    borderRadius: '6px', 
                                    padding: '2px 8px', 
                                    fontFamily: 'Itim',
                                }
                            }} 
                        />
                        <FormControlLabel 
                            value={1} 
                            control={<Radio sx={{ color: 'lightgray', '&.Mui-checked': { color: '#9c76e4ff' } }} />} 
                            label="Multiplayer" 
                            sx={{ 
                                '.MuiFormControlLabel-label': { 
                                    backgroundColor: '#9c76e4', 
                                    borderRadius: '6px', 
                                    padding: '2px 8px', 
                                    fontFamily: 'Itim',
                                }
                            }} 
                        />
                </RadioGroup>
            </FormControl>
        </div>
    );
}

export default GameMode;