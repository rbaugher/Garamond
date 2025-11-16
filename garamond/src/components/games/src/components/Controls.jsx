import * as React from "react";
import Button from '@mui/material/Button';
import ReplayCircleFilledRoundedIcon from '@mui/icons-material/ReplayCircleFilledRounded';
import Stack from '@mui/material/Stack';

function Controls({ onClick }) {
  return (
    <section className="controls">
        <Stack>
            <Button id='reset' size="large" variant="outlined" endIcon={<ReplayCircleFilledRoundedIcon />} onClick={onClick}>
                Reset
            </Button>
        </Stack>
    </section>
  );
}
export default Controls;