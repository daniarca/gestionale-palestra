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
    fontFamily: 'Poppins, sans-serif',
    h4: { fontWeight: 700, fontSize: '2.125rem' },
    h5: { fontWeight: 600, fontSize: '1.5rem' },
    h6: { fontWeight: 600, fontSize: '1.25rem' },
  },
  shape: {
    borderRadius: 12,
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
    // --- SOLUZIONE AL PROBLEMA DI VISIBILITÀ ---
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(94, 129, 172, 0.3)',
            color: '#ECEFF4', // Colore del testo per lo stato "selezionato"
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(94, 129, 172, 0.4)',
            color: '#ECEFF4', // Assicura che il colore del testo rimanga chiaro anche al passaggio del mouse
          },
          '&:hover': {
            backgroundColor: 'rgba(94, 129, 172, 0.2)',
            color: '#ECEFF4', // Colore del testo per lo stato "hover"
          }
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          '&.Mui-selected': { color: '#ECEFF4' } // Colore dell'icona quando selezionata
        }
      }
    }
    // ------------------------------------------
  }
});

export default theme;