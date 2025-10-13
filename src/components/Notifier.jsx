import React from 'react';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useNotification } from '../context/NotificationContext';

function Notifier() {
  const { 
    snackbar, 
    handleSnackbarClose, 
    reminderDialog, 
    handleReminderClose, 
    handleReminderDisable 
  } = useNotification();

  const handleClick = () => {
    if (snackbar.onClick) {
      snackbar.onClick();
    }
    // Chiudiamo la notifica dopo il click
    handleSnackbarClose();
  };

  const hasAction = !!snackbar.onClick;

  return (
    <>
      {/* Notifiche standard (in alto) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%', cursor: hasAction ? 'pointer' : 'default', boxShadow: 6 }}
          onClick={hasAction ? handleClick : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialogo per i promemoria (al centro) */}
      <Dialog
        open={reminderDialog.open}
        onClose={handleReminderClose}
        aria-labelledby="reminder-dialog-title"
      >
        <DialogTitle id="reminder-dialog-title" sx={{ fontWeight: 'bold' }}>
          🔔 Promemoria
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {reminderDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReminderDisable}>Non mostrare più</Button>
          <Button onClick={handleReminderClose} autoFocus variant="contained">OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Notifier;