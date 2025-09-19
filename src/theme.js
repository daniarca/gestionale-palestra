// File: src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5E81AC' },
    secondary: { main: '#8FBCBB' },
    success: { main: '#A3BE8C' },
    warning: { main: '#EBCB8B' },
    error: { main: '#BF616A' },
    info: { main: '#88C0D0' },
    background: { default: '#2E3440', paper: '#3B4252' },
    text: { primary: '#ECEFF4', secondary: '#D8DEE9' },
    divider: '#4C566A',
  },
  typography: {
    fontFamily: 'Poppins, sans-serif', // <-- FONT AGGIORNATO
    h4: { fontWeight: 700, fontSize: '2.125rem' },
    h5: { fontWeight: 600, fontSize: '1.5rem' },
    h6: { fontWeight: 600, fontSize: '1.25rem' },
  },
  shape: {
    borderRadius: 12, // Bordi più arrotondati
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 'bold' } },
      defaultProps: { disableElevation: true }
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } }
    },
    MuiMenuItem: {
      styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(94, 129, 172, 0.2)', color: '#FFFFFF' } } },
    },
  }
});

export default theme;