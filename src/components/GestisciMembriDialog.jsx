import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, List, ListItem, ListItemText, Paper, Typography, Box } from '@mui/material';

function GestisciMembriDialog({ open, onClose, onSave, gruppo, iscritti = [] }) {
  const [membriNelGruppo, setMembriNelGruppo] = useState([]);
  const [membriFuoriDalGruppo, setMembriFuoriDalGruppo] = useState([]);

  useEffect(() => {
    if (gruppo) {
      const idsMembri = gruppo.membri || [];
      const iscrittiNelGruppo = iscritti.filter(i => idsMembri.includes(i.id)).sort((a,b) => a.cognome.localeCompare(b.cognome));
      const iscrittiFuori = iscritti.filter(i => !idsMembri.includes(i.id)).sort((a,b) => a.cognome.localeCompare(b.cognome));
      setMembriNelGruppo(iscrittiNelGruppo);
      setMembriFuoriDalGruppo(iscrittiFuori);
    }
  }, [gruppo, iscritti, open]);

  const spostaInGruppo = (iscritto) => {
    setMembriFuoriDalGruppo(membriFuoriDalGruppo.filter(i => i.id !== iscritto.id));
    setMembriNelGruppo([...membriNelGruppo, iscritto].sort((a,b) => a.cognome.localeCompare(b.cognome)));
  };

  const rimuoviDaGruppo = (iscritto) => {
    setMembriNelGruppo(membriNelGruppo.filter(i => i.id !== iscritto.id));
    setMembriFuoriDalGruppo([...membriFuoriDalGruppo, iscritto].sort((a,b) => a.cognome.localeCompare(b.cognome)));
  };

  const handleSave = () => {
    const idsMembriFinali = membriNelGruppo.map(i => i.id);
    onSave(gruppo.id, idsMembriFinali);
  };

  const renderList = (title, items, action) => (
    <Paper sx={{ p: 2, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title} ({items.length})</Typography>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List dense>
          {items.map(iscritto => (
            <ListItem key={iscritto.id} button onClick={() => action(iscritto)}>
              <ListItemText primary={`${iscritto.cognome} ${iscritto.nome}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Gestisci Membri per: **{gruppo?.nome}**</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>{renderList('Atleti nel Gruppo', membriNelGruppo, rimuoviDaGruppo)}</Grid>
          <Grid item xs={6}>{renderList('Atleti non nel Gruppo', membriFuoriDalGruppo, spostaInGruppo)}</Grid>
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