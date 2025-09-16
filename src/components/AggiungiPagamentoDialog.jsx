import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

const annoSportivo = [
  { nome: 'Settembre', index: 8 }, { nome: 'Ottobre', index: 9 }, { nome: 'Novembre', index: 10 }, 
  { nome: 'Dicembre', index: 11 }, { nome: 'Gennaio', index: 0 }, { nome: 'Febbraio', index: 1 }, 
  { nome: 'Marzo', index: 2 }, { nome: 'Aprile', index: 3 }, { nome: 'Maggio', index: 4 }, 
  { nome: 'Giugno', index: 5 }
];

function AggiungiPagamentoDialog({ open, onClose, onSave, iscritto }) {
  const [cifra, setCifra] = useState('');
  const [tipoPagamento, setTipoPagamento] = useState('Quota Mensile');
  const [meseSelezionato, setMeseSelezionato] = useState(new Date().getMonth());

  const handleSave = () => {
    if (!cifra || isNaN(cifra) || cifra <= 0) {
      alert("Per favore, inserisci una cifra valida.");
      return;
    }
    // Passiamo tutti i dati necessari alla funzione di salvataggio
    onSave({
      cifra: parseFloat(cifra),
      tipo: tipoPagamento,
      mese: tipoPagamento === 'Quota Mensile' ? meseSelezionato : null
    });
    // Reset
    setCifra('');
    setTipoPagamento('Quota Mensile');
    setMeseSelezionato(new Date().getMonth());
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Nuovo Pagamento per {iscritto?.nome} {iscritto?.cognome}</DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        <FormControl fullWidth margin="dense">
          <InputLabel>Tipo di Pagamento</InputLabel>
          <Select
            label="Tipo di Pagamento"
            value={tipoPagamento}
            onChange={(e) => setTipoPagamento(e.target.value)}
          >
            <MenuItem value="Quota Mensile">Quota Mensile</MenuItem>
            <MenuItem value="Quota Iscrizione">Quota Iscrizione</MenuItem>
          </Select>
        </FormControl>

        {tipoPagamento === 'Quota Mensile' && (
          <FormControl fullWidth margin="dense">
            <InputLabel>Mese di Riferimento</InputLabel>
            <Select
              label="Mese di Riferimento"
              value={meseSelezionato}
              onChange={(e) => setMeseSelezionato(e.target.value)}
            >
              {annoSportivo.map(mese => (
                <MenuItem key={mese.index} value={mese.index}>{mese.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        <TextField autoFocus margin="dense" name="cifra" label="Cifra Pagata (€)" type="number" fullWidth variant="outlined" value={cifra} onChange={(e) => setCifra(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained">Salva Pagamento</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AggiungiPagamentoDialog;