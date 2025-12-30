import React from 'react';
import Button from '@mui/material/Button';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

export default function StatsControl({ id='stats', label='Stats', active=false, onToggle, size='small', variant='outlined', fullWidth=false, iconOnly=false }) {
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
        <QueryStatsIcon />
      </Button>
    );
  }
  return (
    <Button
      id={id}
      size={size}
      variant={variant}
      startIcon={<QueryStatsIcon />}
      onClick={onToggle}
      className="control-button"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}
