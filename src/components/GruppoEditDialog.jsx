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
} from "@mui/material";
import { AddCircleOutline, Delete } from "@mui/icons-material";
import { giorniSettimana, orari } from "../utils/timeSlots.js";

function GruppoEditDialog({ open, onClose, onSave, gruppo, staff = [] }) {
  const [formData, setFormData] = useState(gruppo || {});
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (gruppo) {
      setFormData(gruppo);
      setSlots(gruppo.slots || []); // gestisce gruppi vecchi senza slots
    }
  }, [gruppo, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlot = () => {
    setSlots([...slots, { giorno: "", oraInizio: "", oraFine: "" }]);
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

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Giorni e Orari del Gruppo
            </Typography>

            {slots.map((slot, i) => (
              <Grid
                container
                spacing={1}
                key={i}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
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
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
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
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
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
                <Grid item xs={12} sm={4}>
  <FormControl fullWidth margin="dense">
    <InputLabel>Sede</InputLabel>
    <Select
      name="sede"
      label="Sede"
      value={formData.sede || ""}
      onChange={handleChange}
    >
      <MenuItem value="Frascati">Frascati</MenuItem>
      <MenuItem value="Rocca Priora">Rocca Priora</MenuItem>
    </Select>
  </FormControl>
</Grid>

                <Grid item xs={12} sm={2}>
                  <IconButton color="error" onClick={() => handleRemoveSlot(i)}>
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<AddCircleOutline />}
              onClick={handleAddSlot}
              sx={{ mt: 1 }}
            >
              Aggiungi Slot
            </Button>
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
