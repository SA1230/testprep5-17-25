import { createTheme } from '@mui/material/styles';

// Theme configuration based on the specification
export const theme = createTheme({
  palette: {
    primary: { main: '#362E6A' }, // Dreambound Purple
    secondary: { main: '#8C1D2D' }, // Dreambound Red (Gradient Mid)
    error: { main: '#C0103A' }, // Dreambound Red (Gradient Dark)
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5', // Neutral Gray 10
    },
    text: {
      primary: '#212121', // Neutral Gray 90
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'sans-serif'].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;
