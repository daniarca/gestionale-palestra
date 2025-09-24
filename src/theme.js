// File: src/theme.js

import { createTheme } from '@mui/material/styles';

// --- Funzione per Applicare Regole di Contrasto Comuni (RIUTILIZZATE) ---
// Questa funzione include i FIX per il contrasto e la risoluzione del problema 'viola' sui link
const getBaseComponents = (mode) => ({
    MuiButton: {
        styleOverrides: { 
            root: { 
                textTransform: 'none', 
                fontWeight: 'bold', 
                // FIX CRITICO: Eredita il colore dal pulsante sia in stato normale che in hover
                '& a': { color: 'inherit' },
                '& a:hover': { color: 'inherit' }
            },
            // Controlla il colore del testo sui pulsanti a seconda del contrasto
            containedPrimary: { color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' }, 
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
            // Forziamo il contrasto: testo scuro su sfondi chiari, testo chiaro su sfondi scuri
            filledError: { color: mode === 'light' ? '#FFFFFF' : '#ECEFF4' }, 
            filledWarning: { color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' }, 
            filledSuccess: { color: mode === 'light' ? '#1E1E2E' : '#ECEFF4' }, 
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
      primary: { main: '#E2BD86' },     // Oro/Beige (per risalto)
      secondary: { main: '#4A4D7A' },   // Blu scuro (per coerenza)
      success: { main: '#6AA84F' },     // Verde scuro leggibile
      warning: { main: '#F1C232' },     // Giallo scuro leggibile
      error: { main: '#CC0000' },       // Rosso scuro leggibile
      info: { main: '#4A86E8' },
      background: { 
        default: '#1E1E2E', // Grigio scuro soft (nuovo sfondo)
        paper: '#282C34'   // Grigio scuro leggermente diverso per le card
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
      primary: { main: '#6A5ACD' },     
      secondary: { main: '#A07EDD' },  
      success: { main: '#7BD94F' },     // Verde brillante
      warning: { main: '#FFC84E' },     // Giallo/Arancio
      error: { main: '#FF6B6B' },       // Rosa/Rosso errore
      info: { main: '#7BD3EF' },        // Azzurro info
      background: { 
        default: '#F7F8FC', // Sfondo leggermente off-white
        paper: '#FFFFFF'   // Bianco puro per le card
      },
      text: { primary: '#1E1E2E', secondary: '#7C7895' }, // Testo scuro/grigio-viola
      divider: 'rgba(122, 120, 149, 0.2)', 
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h4: { fontWeight: 700, fontSize: '2.125rem' },
      h5: { fontWeight: 600, fontSize: '1.5rem' },
      h6: { fontWeight: 600, fontSize: '1.25rem' },
    },
    shape: {
      borderRadius: 16, // Bordo arrotondato come l'app mobile
    },
    components: getBaseComponents('light'),
  }),

  // Tema 4: pastel (NUOVO TEMA: Ispirato a Pastel Dreams)
  pastel: createTheme({
    palette: {
      mode: 'light',
      // Colori della palette Pastel Dreams
      primary: { main: '#FF99C8' },     // Rosa
      secondary: { main: '#A9DEF9' },  // Azzurro
      success: { main: '#D0F4DE' },     // Menta
      warning: { main: '#E4C1F9' },     // Lavanda
      error: { main: '#EF5350' },       // Rosso tenue
      info: { main: '#FCF6BD' },        // Giallo (Usato come info/sfondo card non-Paper)
      background: { 
        default: '#FCF6BD', // Giallo tenue (sfondo principale)
        paper: '#FFFFFF'   // Bianco puro per le card
      },
      text: { primary: '#1E1E2E', secondary: '#5D576B' }, // Testo scuro
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