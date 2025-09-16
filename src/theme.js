import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#A78BFA', // Viola/Lavanda
    },
    success: {
      main: '#A6E3A1', // Verde
    },
    warning: {
      main: '#FAB387', // Arancione/Pesca
    },
    error: {
      main: '#F38BA8', // Rosso/Rosa
    },
    info: {
      main: '#89B4FA', // Blu
    },
    background: {
      default: '#1E1E2E',
      paper: '#313244',
    },
    text: {
      primary: '#D9E0EE',
      secondary: '#a6adc8'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: { fontWeight: 700, fontSize: '2.2rem' },
    h5: { fontWeight: 600, fontSize: '1.5rem' },
    h6: { fontWeight: 600, fontSize: '1.25rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
          borderRadius: '12px',
        }
      }
    }
  }
});

export default theme;