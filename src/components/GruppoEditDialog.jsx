import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { giorniSettimana, orari } from "../utils/timeSlots.js";

function GruppoEditDialog({ open, onClose, onSave, gruppo, staff = [] }) {
  const [formData, setFormData] = useState(gruppo || {});

  useEffect(() => {
    if (gruppo) {
      setFormData(gruppo);
    }
  }, [gruppo, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!gruppo) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Modifica Gruppo: {gruppo.nome}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              name="nome"
              label="Nome Gruppo"
              value={formData.nome || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              name="descrizione"
              label="Descrizione"
              value={formData.descrizione || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Allenatore</InputLabel>
              <Select
                name="staffId"
                label="Allenatore"
                value={formData.staffId || ""}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Nessuno</em>
                </MenuItem>
                {staff.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.cognome} {s.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Giorno</InputLabel>
              <Select
                name="giornoSettimana"
                label="Giorno"
                value={formData.giornoSettimana ?? ""}
                onChange={handleChange}
              >
                {giorniSettimana.map((g) => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Ora Inizio</InputLabel>
              <Select
                name="oraInizio"
                label="Ora Inizio"
                value={formData.oraInizio || ""}
                onChange={handleChange}
              >
                {orari.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Ora Fine</InputLabel>
              <Select
                name="oraFine"
                label="Ora Fine"
                value={formData.oraFine || ""}
                onChange={handleChange}
              >
                {orari.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained">
          Salva Modifiche
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default GruppoEditDialog;
