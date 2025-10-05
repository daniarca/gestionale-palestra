// File: src/components/TecnicoEditDialog.jsx (AGGIORNATO)

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

function TecnicoEditDialog({ open, onClose, onSave, tecnico }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (tecnico) {
      // Se stiamo modificando, popola il form, assicurando pagaOraria
      setFormData({
        ...tecnico,
        pagaOraria: tecnico.pagaOraria ?? 0,
      });
    } else {
      // Se stiamo creando, imposta un default
      setFormData({ ruolo: "Allenatore", pagaOraria: 0 }); 
    }
  }, [tecnico, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        // Conversione esplicita a float per pagaOraria
        [name]: (name === 'pagaOraria') ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSave = () => {
    // La paga oraria viene passata come numero o 0
    onSave({
        ...formData,
        pagaOraria: parseFloat(formData.pagaOraria) || 0,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {tecnico ? `Modifica: ${tecnico.cognome}` : "Nuovo Tecnico"}
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={formData.nome || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cognome"
              name="cognome"
              value={formData.cognome || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Luogo di Nascita"
              name="luogoNascita"
              value={formData.luogoNascita || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data di Nascita"
              name="dataNascita"
              type="date"
              value={formData.dataNascita || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Codice Fiscale"
              name="codiceFiscale"
              value={formData.codiceFiscale || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Ruolo</InputLabel>
              <Select
                label="Ruolo"
                name="ruolo"
                value={formData.ruolo || "Allenatore"}
                onChange={handleChange}
              >
                <MenuItem value="Allenatore">Allenatore</MenuItem>
                <MenuItem value="Segreteria">Segreteria</MenuItem>
                <MenuItem value="Dirigente">Dirigente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Via"
              name="via"
              value={formData.via || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="CAP"
              name="cap"
              value={formData.cap || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Città di Residenza"
              name="residenza"
              value={formData.residenza || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Provincia"
              name="provincia"
              value={formData.provincia || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cellulare"
              name="cellulare"
              value={formData.cellulare || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Numero Tessera"
              name="numeroTessera"
              value={formData.numeroTessera || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Numero Documento"
              name="numeroDocumento"
              value={formData.numeroDocumento || ""}
              onChange={handleChange}
            />
          </Grid>
          {/* NUOVO CAMPO: Paga Oraria */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Paga Oraria (€)"
              name="pagaOraria"
              type="number"
              value={formData.pagaOraria || 0}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained">
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default TecnicoEditDialog;