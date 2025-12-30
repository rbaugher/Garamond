import React from 'react';
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function MechanicsControl({ id='mechanics', label='How to Play', active=false, onToggle, size='small', variant='outlined', fullWidth=false, iconOnly=false }) {
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
        <HelpOutlineIcon />
      </Button>
    );
  }
  return (
    <Button
      id={id}
      size={size}
      variant={variant}
      startIcon={<HelpOutlineIcon />}
      onClick={onToggle}
      className="control-button"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}
