// File: src/theme.js

import { createTheme } from '@mui/material/styles';

// Esporta un oggetto che contiene tutti i temi
export const themes = {

  // Tema Originale (ora chiamato 'nordic')
  nordic: createTheme({
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
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: 'rgba(94, 129, 172, 0.3)',
              color: '#ECEFF4',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'rgba(94, 129, 172, 0.4)',
              color: '#ECEFF4',
            },
            '&:hover': {
              backgroundColor: 'rgba(94, 129, 172, 0.2)',
              color: '#ECEFF4',
            }
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { color: '#ECEFF4' }
          }
        }
      }
    }
  }),

  // Tema 1: default
  default: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#F7567C' },
      secondary: { main: '#99E1D9' },
      background: { default: '#FCFCFC', paper: '#FFFAE3' },
      text: { primary: '#5D576B', secondary: '#99E1D9' },
      divider: '#5D576B',
    },
  }),

  // Tema 2: asdgym
  asdgym: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#4A4D7A' },
      secondary: { main: '#E2BD86' },
      background: { default: '#000000', paper: '#DFD7D0' },
      text: { primary: '#FFFFFF', secondary: '#E2BD86' },
      divider: '#4A4D7A',
    },
  }),

  // Tema 3: federal
  federal: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#2D82B7' },
      secondary: { main: '#42E2B8' },
      background: { default: '#07004D', paper: '#F3DFBF' },
      text: { primary: '#FFFFFF', secondary: '#EB8A90' },
      divider: '#2D82B7',
    },
  }),

  // Tema 4: persianpink
  persianpink: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#EB7BC0' },
      secondary: { main: '#C46BAE' },
      background: { default: '#EED5C2', paper: '#EDA4BD' },
      text: { primary: '#7C606B', secondary: '#C46BAE' },
      divider: '#EB7BC0',
    },
  }),
};