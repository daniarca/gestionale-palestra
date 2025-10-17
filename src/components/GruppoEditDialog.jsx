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
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { AddCircleOutline, Delete } from "@mui/icons-material";
import { giorniSettimana, orari } from "../utils/timeSlots.js";

function GruppoEditDialog({ open, onClose, onSave, gruppo, staff = [] }) {
  const [formData, setFormData] = useState(gruppo || {});
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (gruppo) {
      setFormData(gruppo);
      setSlots(gruppo.slots || []);
    }
  }, [gruppo, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlot = () => {
    setSlots([...slots, { giorno: "", oraInizio: "", oraFine: "", sede: "" }]);
  };

  const handleRemoveSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleSave = () => {
    onSave({ ...formData, slots });
  };

  if (!gruppo) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Modifica Gruppo: {formData.nome}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {/* Sezione Dati Principali */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Dati Principali Gruppo
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                name="nome"
                label="Nome Gruppo"
                value={formData.nome || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                name="descrizione"
                label="Descrizione"
                value={formData.descrizione || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" variant="outlined">
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
          </Grid>
        </Box>

        {/* Sezione Orari */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Giorni e Orari del Gruppo
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Button
            startIcon={<AddCircleOutline />}
            onClick={handleAddSlot}
            sx={{ mb: 2 }}
          >
            Aggiungi Slot Orario
          </Button>

          {slots.map((slot, i) => (
            <Box
              key={i}
              sx={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                p: 2,
                mb: 2,
                position: "relative",
              }}
            >
              <IconButton
                color="error"
                onClick={() => handleRemoveSlot(i)}
                sx={{ position: "absolute", top: 8, right: 8 }}
              >
                <Delete />
              </IconButton>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Giorno</InputLabel>
                    <Select
                      value={slot.giorno}
                      label="Giorno"
                      onChange={(e) =>
                        handleSlotChange(i, "giorno", e.target.value)
                      }
                    >
                      {giorniSettimana.map((g) => (
                        <MenuItem key={g.value} value={g.value}>
                          {g.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Sede</InputLabel>
                    <Select
                      label="Sede"
                      value={slot.sede || ""}
                      onChange={(e) =>
                        handleSlotChange(i, "sede", e.target.value)
                      }
                    >
                      <MenuItem value="Frascati">Frascati</MenuItem>
                      <MenuItem value="Rocca Priora">Rocca Priora</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Ora Inizio</InputLabel>
                    <Select
                      value={slot.oraInizio}
                      label="Ora Inizio"
                      onChange={(e) =>
                        handleSlotChange(i, "oraInizio", e.target.value)
                      }
                    >
                      {orari.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Ora Fine</InputLabel>
                    <Select
                      value={slot.oraFine}
                      label="Ora Fine"
                      onChange={(e) =>
                        handleSlotChange(i, "oraFine", e.target.value)
                      }
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
            </Box>
          ))}
        </Box>
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