import React from 'react';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';

export default function SettingsControl({ id='settings', label='Settings', active=false, onToggle, size='small', variant='outlined', fullWidth=false }) {
  return (
    <Button
      id={id}
      size={size}
      variant={variant}
      startIcon={<SettingsIcon />}
      onClick={onToggle}
      className="control-button"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}
