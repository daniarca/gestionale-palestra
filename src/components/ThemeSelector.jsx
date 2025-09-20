// src/components/ThemeSelector.jsx

import React from 'react';
import { Button, Box, Typography, Menu, MenuItem } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import { useTheme } from '../context/ThemeContext.jsx';

// Elenco dei temi disponibili
const themeOptions = [
  { name: 'Nordic', key: 'nordic' },
  { name: 'Default', key: 'default' },
  { name: 'ASD Gym', key: 'asdgym' },
  { name: 'Federal', key: 'federal' },
  { name: 'Persian Pink', key: 'persianpink' },
];

function ThemeSelector() {
  const { currentTheme, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (themeKey) => {
    toggleTheme(themeKey);
    handleClose();
  };

  return (
    <Box>
      <Button
        id="theme-button"
        aria-controls={open ? 'theme-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<PaletteIcon />}
        variant="contained"
      >
        Cambia Tema
      </Button>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.key}
            onClick={() => handleThemeChange(option.key)}
            selected={option.key === currentTheme}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default ThemeSelector;