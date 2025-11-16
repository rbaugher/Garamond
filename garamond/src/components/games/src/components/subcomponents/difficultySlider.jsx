import React from 'react';
import Slider from '@mui/material/Slider';
import { marks } from '../context/DifficultyContext';

function Difficulty({ level, onChange }) {
    const handleChange = (_, value) => {
        onChange(value);
    };
    return (
        <div className='slider'>
            <Slider
                id="difficulty-slider"
                value={level}
                min={0}
                max={2}
                step={1}
                marks={marks}
                sx={{
                    color: '#9c76e4ff',
                    '& .MuiSlider-thumb': { backgroundColor: '#9c76e4ff' },
                    '& .MuiSlider-track': { backgroundColor: '#9c76e4ff' },
                    '& .MuiSlider-rail': { backgroundColor: '#9c76e4ff' }
                }}
                onChange={handleChange}
                valueLabelDisplay="off"
                slotProps={{
                    markLabel: { style: { color: 'lightgray', fontFamily: 'Itim', fontSize: '20px'} }
                }}
            />
        </div>
    );
}

export default Difficulty;