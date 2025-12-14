import React from 'react';
import Button from '@mui/material/Button';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function GameModeControl({ id='gamemode', label='Game Mode', active=false, onToggle, size='small', variant='outlined', fullWidth=false }) {
  return (
    <Button
      id={id}
      size={size}
      variant={variant}
      startIcon={<SmartToyIcon />}
      onClick={onToggle}
      className="control-button"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}
