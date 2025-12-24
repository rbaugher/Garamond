import React from 'react';
import Slider from '@mui/material/Slider';
import { marks } from '../context/DifficultyContext';
import { getStoredUser } from '../../../utils/session';

function Difficulty({ level, onChange }) {
    const handleChange = (_, value) => {
        onChange(value);
    };
    const isSignedIn = !!getStoredUser();
    const sliderMarks = isSignedIn ? marks : marks.filter(m => m.value <= 2);
    const max = isSignedIn ? 3 : 2;
    return (
        <div className='slider'>
            <Slider
                id="difficulty-slider"
                value={level}
                min={0}
                max={max}
                step={1}
                marks={sliderMarks}
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
