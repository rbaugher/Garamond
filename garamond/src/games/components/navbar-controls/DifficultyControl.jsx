import React from 'react';
import Button from '@mui/material/Button';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

export default function DifficultyControl({ id='difficulty', label='Difficulty', active=false, onToggle, size='small', variant='outlined', fullWidth=false }) {
  return (
    <Button
      id={id}
      size={size}
      variant={variant}
      startIcon={<FitnessCenterIcon />}
      onClick={onToggle}
      className="control-button"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}
