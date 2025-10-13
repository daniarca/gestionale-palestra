// File: src/context/NotificationContext.jsx (Nuovo File)

import React, { createContext, useState, useContext, useCallback } from 'react';
import { updateAgendaEventPartial } from '../services/firebaseService';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // success, error, warning, info
    onClick: null,
  });

  const [reminderDialog, setReminderDialog] = useState({
    open: false,
    message: '',
    event: null,
  });

  const showNotification = useCallback((message, severity = 'info', onClick = null) => {
    setSnackbar({ open: true, message, severity, onClick });
  }, []);

  const showReminder = useCallback((message, event) => {
    setReminderDialog({ open: true, message, event });
  }, []);

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleReminderClose = useCallback(() => {
    setReminderDialog(prev => ({ ...prev, open: false }));
  }, []);

  const handleReminderDisable = useCallback(async () => {
    const { event } = reminderDialog;
    if (event) {
      // Usiamo la nuova funzione per aggiornare solo il campo reminderSent.
      await updateAgendaEventPartial({ id: event.id, reminderSent: true });
    }
    setReminderDialog(prev => ({ ...prev, open: false }));
  }, [reminderDialog]);

  const value = {
    snackbar,
    reminderDialog,
    showNotification,
    showReminder,
    handleSnackbarClose,
    handleReminderClose,
    handleReminderDisable,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}