// src/context/ThemeContext.jsx

import React, { createContext, useState, useContext, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { themes } from '../theme.js';

const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
  // Il tema predefinito è impostato su 'default', che è presente nel tuo theme.js
  const [currentTheme, setCurrentTheme] = useState('nordic'); 

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  // useMemo serve a ricalcolare il tema solo quando il nome cambia, ottimizzando le performance
  const theme = useMemo(() => {
    // Gestisce il caso in cui il tema non esista, per prevenire errori
    return themes[currentTheme] || themes['nordic'];
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);