// File: src/components/IscrittoEditDialog.jsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Checkbox, FormControlLabel, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

// Nuove costanti per Livelli e Categorie
const LIVELLI = ['Base', 'Intermedio', 'Avanzato', 'Agonismo'];
const CATEGORIE = ['Microbaby', 'Allieva', 'Junior', 'Senior'];

function IscrittoEditDialog({ iscritto, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (iscritto) {
      // Pre-popola il form con i dati dell'iscritto, gestendo i campi nidificati
      setFormData({
        ...iscritto,
        haCertificato: iscritto.certificatoMedico?.presente || false,
        scadenzaCertificato: iscritto.certificatoMedico?.scadenza || '',
        scadenzaAbbonamento: iscritto.abbonamento?.scadenza || '',
        // Nuovi campi
        livello: iscritto.livello || '',
        categoria: iscritto.categoria || '',
      });
    }
  }, [iscritto, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    // Riorganizza i dati nella struttura corretta per Firebase prima di salvare
    const { haCertificato, scadenzaCertificato, scadenzaAbbonamento, livello, categoria, ...rest } = formData;
    const dataToSave = {
      ...rest,
      certificatoMedico: { presente: haCertificato, scadenza: scadenzaCertificato },
      abbonamento: { scadenza: scadenzaAbbonamento },
      livello, // Salva il nuovo campo
      categoria, // Salva il nuovo campo
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
          
          {/* NUOVI CAMPI LIVELLO E CATEGORIA */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
                <InputLabel>Livello</InputLabel>
                <Select name="livello" label="Livello" value={formData.livello || ''} onChange={handleChange}>
                    <MenuItem value=""><em>N/D</em></MenuItem>
                    {LIVELLI.map(lvl => <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>)}
                </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
                <InputLabel>Categoria</InputLabel>
                <Select name="categoria" label="Categoria" value={formData.categoria || ''} onChange={handleChange}>
                    <MenuItem value=""><em>N/D</em></MenuItem>
                    {CATEGORIE.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="quotaIscrizione" label="Quota Iscrizione (€)" type="number" value={formData.quotaIscrizione || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="quotaMensile" label="Quota Mensile Prevista (€)" type="number" value={formData.quotaMensile || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={8}><TextField fullWidth margin="dense" name="luogoNascita" label="Luogo di Nascita" value={formData.luogoNascita || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth margin="dense" name="dataNascita" label="Data di Nascita" type="date" value={formData.dataNascita || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={9}><TextField fullWidth margin="dense" name="via" label="Indirizzo (Via / Piazza)" value={formData.via || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={3}><TextField fullWidth margin="dense" name="numeroCivico" label="N. Civico" value={formData.numeroCivico || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={9}><TextField fullWidth margin="dense" name="residenza" label="Città di Residenza" value={formData.residenza || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={3}><TextField fullWidth margin="dense" name="cap" label="CAP" value={formData.cap || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="email" label="Email" value={formData.email || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="cellulare" label="Cellulare" value={formData.cellulare || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="codiceFiscale" label="Codice Fiscale Atleta" value={formData.codiceFiscale || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="codiceAssicurazione" label="Codice Assicurazione" value={formData.codiceAssicurazione || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="nomeGenitore" label="Cognome e Nome Genitore" value={formData.nomeGenitore || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="cfGenitore" label="Codice Fiscale Genitore" value={formData.cfGenitore || ''} onChange={handleChange}/></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth margin="dense"><InputLabel>Sede</InputLabel><Select name="sede" label="Sede" value={formData.sede || 'Frascati'} onChange={handleChange}><MenuItem value="Frascati">Frascati</MenuItem><MenuItem value="Rocca Priora">Rocca Priora</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="scadenzaAbbonamento" label="Scadenza Abbonamento" type="date" value={formData.scadenzaAbbonamento || ''} onChange={handleChange} InputLabelProps={{ shrink: true }}/></Grid>
          <Grid item xs={12} sm={6}><FormControlLabel control={<Checkbox name="haCertificato" checked={formData.haCertificato || false} onChange={handleChange} />} label="Certificato Medico Presente" /></Grid>
          {formData.haCertificato && (<Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="scadenzaCertificato" label="Scadenza Certificato" type="date" value={formData.scadenzaCertificato || ''} onChange={handleChange} InputLabelProps={{ shrink: true }}/></Grid>)}
          <Grid item xs={12}><TextField fullWidth margin="dense" name="annotazioni" label="Annotazioni Segreteria" multiline rows={3} value={formData.annotazioni || ''} onChange={handleChange} /></Grid>
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