// File: src/components/GestisciMembriDialog.jsx (Nuovo File)

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, List, ListItem, ListItemText, Checkbox, Paper, Typography } from '@mui/material';

function GestisciMembriDialog({ open, onClose, onSave, gruppo, iscritti = [] }) {
  const [membriNelGruppo, setMembriNelGruppo] = useState([]);
  const [membriFuoriDalGruppo, setMembriFuoriDalGruppo] = useState([]);

  useEffect(() => {
    if (gruppo) {
      const idsMembri = gruppo.membri || [];
      setMembriNelGruppo(iscritti.filter(i => idsMembri.includes(i.id)));
      setMembriFuoriDalGruppo(iscritti.filter(i => !idsMembri.includes(i.id)));
    }
  }, [gruppo, iscritti, open]);

  const spostaInGruppo = (iscritto) => {
    setMembriFuoriDalGruppo(membriFuoriDalGruppo.filter(i => i.id !== iscritto.id));
    setMembriNelGruppo([...membriNelGruppo, iscritto]);
  };

  const rimuoviDaGruppo = (iscritto) => {
    setMembriNelGruppo(membriNelGruppo.filter(i => i.id !== iscritto.id));
    setMembriFuoriDalGruppo([...membriFuoriDalGruppo, iscritto]);
  };

  const handleSave = () => {
    const idsMembriFinali = membriNelGruppo.map(i => i.id);
    onSave(gruppo.id, idsMembriFinali);
  };

  const renderList = (title, items, action) => (
    <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title} ({items.length})</Typography>
      <List dense>
        {items.map(iscritto => (
          <ListItem
            key={iscritto.id}
            button
            onClick={() => action(iscritto)}
          >
            <ListItemText primary={`${iscritto.nome} ${iscritto.cognome}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Gestisci Membri per il Gruppo: **{gruppo?.nome}**</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            {renderList('Atleti nel Gruppo', membriNelGruppo, rimuoviDaGruppo)}
          </Grid>
          <Grid item xs={6}>
            {renderList('Atleti non nel Gruppo', membriFuoriDalGruppo, spostaInGruppo)}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained">Salva</Button>
      </DialogActions>
    </Dialog>
  );
}

export default GestisciMembriDialog;