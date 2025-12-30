import React from 'react';
import Button from '@mui/material/Button';
import TuneIcon from '@mui/icons-material/Tune';

export default function DifficultyControl({ id='difficulty', label='Difficulty', active=false, onToggle, size='small', variant='outlined', fullWidth=false, iconOnly=false }) {
  if (iconOnly) {
    return (
      <Button
        id={id}
        size={size}
        variant={variant}
        onClick={onToggle}
        className="control-button icon-only"
        fullWidth={fullWidth}
        aria-label={label}
      >
        <TuneIcon />
      </Button>
    );
  }
  return (
    <Button
      id={id}
      size={size}
      variant={variant}
      startIcon={<TuneIcon />}
      onClick={onToggle}
      className="control-button"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}
