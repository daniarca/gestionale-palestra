// File: src/theme.js

import { createTheme } from '@mui/material/styles';

// --- Funzione per Applicare Regole di Contrasto Comuni (RIUTILIZZATE) ---
const getBaseComponents = (mode) => ({
    MuiButton: {
        styleOverrides: { 
            root: { 
                textTransform: 'none', 
                fontWeight: 'bold', 
                '& a': { color: 'inherit' },
                '& a:hover': { color: 'inherit' }
            },
            // FIX CRITICO: Il testo sui pulsanti Primary (che è Viola scuro) DEVE essere BIANCO in light mode.
            containedPrimary: { color: mode === 'light' ? '#ECEFF4' : '#ECEFF4' }, 
            
            containedError: { color: mode === 'light' ? '#FFFFFF' : '#ECEFF4' }, 
            containedWarning: { color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' }, 
            containedSuccess: { color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' }, 
            outlined: { color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' }, 
            text: { color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' },
        },
        defaultProps: { disableElevation: true }
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiMenuItem: { 
        styleOverrides: { 
            root: { 
                '&:hover, &.Mui-focusVisible': { 
                    backgroundColor: mode === 'light' ? 'rgba(106, 90, 205, 0.05)' : 'rgba(226, 189, 134, 0.1)',
                    color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' 
                } 
            } 
        } 
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                '&.Mui-selected': { 
                    backgroundColor: mode === 'light' ? 'rgba(106, 90, 205, 0.1)' : 'rgba(74, 77, 122, 0.4)',
                    color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' 
                },
                '&:hover': { 
                    backgroundColor: mode === 'light' ? 'rgba(106, 90, 205, 0.05)' : 'rgba(226, 189, 134, 0.1)', 
                    color: mode === 'light' ? '#1E1E2E' : '#ECEFF4'
                }
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: { 
                fontWeight: 'bold', 
                '& a': { color: 'inherit' },
                '& a:hover': { color: 'inherit' }
            },
            filledError: { color: mode === 'light' ? '#FFFFFF' : '#ECEFF4' }, 
            filledWarning: { color: 'light' ? '#1E1E2E' : '#ECEFF4' }, 
            filledSuccess: { color: 'light' ? '#1E1E2E' : '#ECEFF4' }, 
        },
    },
    MuiTab: {
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 'bold',
                '&.Mui-focusVisible': {
                    outline: 'none !important',
                },
                '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: mode === 'light' ? '#6A5ACD' : '#E2BD86',
                    border: 'none !important' 
                },
                '&:hover': {
                    backgroundColor: 'rgba(106, 90, 205, 0.03)',
                },
            },
        },
    },
    MuiSvgIcon: { 
        styleOverrides: { 
            root: { 
                '&.Mui-selected': { 
                    color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' 
                } 
            } 
        } 
    }
});


// --- Theme Definitions ---

export const themes = {

  // Tema 1: default (Light - Standard)
  default: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#F7567C' },
      secondary: { main: '#99E1D9' },
      background: { default: '#FCFCFC', paper: '#FFFAE3' },
      text: { primary: '#5D576B', secondary: '#99E1D9' },
      divider: '#5D576B',
      error: { main: '#F44336' },
      warning: { main: '#FF9800' },
    },
    typography: { fontFamily: 'Poppins, sans-serif' },
    shape: { borderRadius: 12 },
    components: getBaseComponents('light'),
  }),

  // Tema 2: asdgym (Dark - Revisionato per leggibilità)
  asdgym: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#E2BD86' },
      secondary: { main: '#4A4D7A' },
      success: { main: '#6AA84F' },
      warning: { main: '#F1C232' },
      error: { main: '#CC0000' },
      info: { main: '#4A86E8' },
      background: { 
        default: '#1E1E2E',
        paper: '#282C34'   
      },
      text: { primary: '#ECEFF4', secondary: '#8F8F8F' }, 
      divider: '#4A4D7A',
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
    components: getBaseComponents('dark'),
  }),

  // Tema 3: smarthome (Ispirato a Smart Home UI)
  smarthome: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#6A5ACD' }, // Viola scuro
      secondary: { main: '#A07EDD' },  // Viola chiaro/Lavanda
      success: { main: '#7BD94F' },
      warning: { main: '#FFC84E' },
      error: { main: '#FF6B6B' },
      info: { main: '#7BD3EF' },
      background: { 
        default: '#F7F8FC',
        paper: '#FFFFFF'
      },
      text: { primary: '#1E1E2E', secondary: '#7C7895' },
      divider: 'rgba(122, 120, 149, 0.2)', 
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h4: { fontWeight: 700, fontSize: '2.125rem' },
      h5: { fontWeight: 600, fontSize: '1.5rem' },
      h6: { fontWeight: 600, fontSize: '1.25rem' },
    },
    shape: {
      borderRadius: 16,
    },
    components: getBaseComponents('light'),
  }),

  // Tema 4: pastel (Ispirato a Pastel Dreams)
  pastel: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#FF99C8' },
      secondary: { main: '#A9DEF9' },
      success: { main: '#D0F4DE' },
      warning: { main: '#E4C1F9' },
      error: { main: '#EF5350' },
      info: { main: '#FCF6BD' },
      background: { 
        default: '#FCF6BD',
        paper: '#FFFFFF'
      },
      text: { primary: '#1E1E2E', secondary: '#5D576B' },
      divider: 'rgba(30, 30, 46, 0.1)', 
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h4: { fontWeight: 700, fontSize: '2.125rem' },
      h5: { fontWeight: 600, fontSize: '1.5rem' },
      h6: { fontWeight: 600, fontSize: '1.25rem' },
    },
    shape: {
      borderRadius: 8,
    },
    components: getBaseComponents('light'),
  }),
};