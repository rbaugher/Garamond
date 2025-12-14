import React from 'react';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/Info';

export default function MechanicsControl({ id='mechanics', label='How to Play', active=false, onToggle, size='small', variant='outlined', fullWidth=false }) {
  return (
    <Button
      id={id}
      size={size}
      variant={variant}
      startIcon={<InfoIcon />}
      onClick={onToggle}
      className="control-button"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}
