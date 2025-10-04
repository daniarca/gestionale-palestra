// File: src/components/RegistroTecnicoDialog.jsx (Aggiornato)

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Box, Typography, Stack, InputAdornment
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import moment from "moment";

function RegistroTecnicoDialog({ open, onClose, onSave, onDelete, event, dateInfo, tecnici = [] }) {
  const [tecnicoId, setTecnicoId] = useState('');
  const [status, setStatus] = useState('Presente');
  const [oreLavorate, setOreLavorate] = useState(8);
  const [start, setStart] = useState('');
  const [tecnicoError, setTecnicoError] = useState(false);

  useEffect(() => {
    if (!open) {
      setTecnicoError(false);
      return;
    }

    if (event) { // Modifica di un evento esistente
      setTecnicoId(event.tecnicoId || '');
      setStatus(event.status || 'Presente');
      setOreLavorate(event.oreLavorate || 8);
      setStart(moment(event.start).format("YYYY-MM-DD"));
    } else if (dateInfo) { // Creazione di un nuovo evento
      setTecnicoId('');
      setStatus('Presente');
      setOreLavorate(8);
      setStart(moment(dateInfo.startStr || dateInfo.dateStr).format("YYYY-MM-DD"));
    }
  }, [event, dateInfo, open]);

  const handleSave = () => {
    if (!tecnicoId) {
      setTecnicoError(true);
      return;
    }
    onSave({
      id: event?.id,
      tecnicoId,
      status,
      oreLavorate: status === 'Presente' ? parseFloat(oreLavorate) : 0,
      start,
      end: start, // Per eventi di un giorno, start e end sono uguali
      allDay: true,
    });
  };

  const handleDelete = () => event?.id && onDelete(event.id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {event ? "Modifica Presenza" : "Registra Presenza"}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Data"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth error={tecnicoError}>
            <InputLabel>Tecnico</InputLabel>
            <Select
              label="Tecnico"
              value={tecnicoId}
              onChange={(e) => {
                setTecnicoId(e.target.value);
                if (tecnicoError) setTecnicoError(false);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              }
            >
              {tecnici.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.cognome} {t.nome}</MenuItem>
              ))}
            </Select>
            {tecnicoError && <Typography color="error" variant="caption" sx={{ pl: 2, pt: 0.5}}>Selezionare un tecnico è obbligatorio.</Typography>}
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Stato</InputLabel>
            <Select
              label="Stato"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
               startAdornment={
                <InputAdornment position="start">
                  <CheckCircleOutlineIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="Presente">Presente</MenuItem>
              <MenuItem value="Assente">Assente</MenuItem>
            </Select>
          </FormControl>
          {status === 'Presente' && (
            <TextField
              fullWidth
              label="Ore Lavorate"
              type="number"
              value={oreLavorate}
              onChange={(e) => setOreLavorate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", p: "16px 24px" }}>
        {event ? (
          <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>Elimina</Button>
        ) : <Box />}
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>Annulla</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Salva</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default RegistroTecnicoDialog;