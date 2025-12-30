import React from 'react';
import Button from '@mui/material/Button';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function GameModeControl({ id='gamemode', label='Game Mode', active=false, onToggle, size='small', variant='outlined', fullWidth=false, iconOnly=false }) {
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
        <SmartToyIcon />
      </Button>
    );
  }
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
