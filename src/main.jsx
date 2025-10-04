// File: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProviderWrapper } from './context/ThemeContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- INIZIO CORREZIONE --- */}
    {/* Aggiungiamo la prop 'basename' per specificare la sottocartella */}
    <BrowserRouter basename="/gestionale">
    {/* --- FINE CORREZIONE --- */}
      <AuthProvider>
        <NotificationProvider>
          <ThemeProviderWrapper>
            <CssBaseline />
            <App />
          </ThemeProviderWrapper>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);