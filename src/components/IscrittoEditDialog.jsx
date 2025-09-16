// File: src/components/IscrittoEditDialog.jsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Checkbox, FormControlLabel, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

function IscrittoEditDialog({ iscritto, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (iscritto) {
      setFormData({
        ...iscritto,
        haCertificato: iscritto.certificatoMedico?.presente || false,
        scadenzaCertificato: iscritto.certificatoMedico?.scadenza || '',
        scadenzaAbbonamento: iscritto.abbonamento?.scadenza || '',
      });
    }
  }, [iscritto, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    const { haCertificato, scadenzaCertificato, scadenzaAbbonamento, ...rest } = formData;
    const dataToSave = {
      ...rest,
      certificatoMedico: { presente: haCertificato, scadenza: scadenzaCertificato },
      abbonamento: { scadenza: scadenzaAbbonamento },
    };
    onSave(dataToSave);
  };

  if (!iscritto) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Modifica Dati: {iscritto.nome} {iscritto.cognome}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="nome" label="Nome" value={formData.nome || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="cognome" label="Cognome" value={formData.cognome || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="quotaMensile" label="Quota Mensile Prevista (€)" type="number" value={formData.quotaMensile || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="scadenzaAbbonamento" label="Scadenza Abbonamento" type="date" value={formData.scadenzaAbbonamento || ''} onChange={handleChange} InputLabelProps={{ shrink: true }}/></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth margin="dense"><InputLabel>Sede</InputLabel><Select name="sede" label="Sede" value={formData.sede || 'Frascati'} onChange={handleChange}><MenuItem value="Frascati">Frascati</MenuItem><MenuItem value="Rocca Priora">Rocca Priora</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="codiceFiscale" label="Codice Fiscale Atleta" value={formData.codiceFiscale || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><FormControlLabel control={<Checkbox name="haCertificato" checked={formData.haCertificato || false} onChange={handleChange} />} label="Certificato Medico Presente" /></Grid>
          {formData.haCertificato && (<Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="scadenzaCertificato" label="Scadenza Certificato" type="date" value={formData.scadenzaCertificato || ''} onChange={handleChange} InputLabelProps={{ shrink: true }}/></Grid>)}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained">Salva Modifiche</Button>
      </DialogActions>
    </Dialog>
  );
}

export default IscrittoEditDialog;