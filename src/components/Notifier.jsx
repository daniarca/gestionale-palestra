// File: src/components/Notifier.jsx (Nuovo File)

import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotification } from '../context/NotificationContext.jsx';

function Notifier() {
  const { notification, handleClose } = useNotification();
  const { open, message, severity } = notification;

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000} // La notifica scompare dopo 4 secondi
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 'bold' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notifier;