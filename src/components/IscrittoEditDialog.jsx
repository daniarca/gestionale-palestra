// File: src/components/IscrittoEditDialog.jsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Typography,
} from "@mui/material";

// Nuove costanti per Livelli e Categorie
const LIVELLI = ["Base", "Intermedio", "Avanzato", "Agonismo"];
const CATEGORIE = ["Baby", "Allieva", "Junior", "Senior"]; // CORREZIONE: Microbaby -> Baby
// NUOVA COSTANTE PER I TIPI DI CELLULARE
const TIPI_CELLULARE = ["Personale", "Mamma", "Papà", "Altro"];

function IscrittoEditDialog({ iscritto, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (iscritto) {
      // Pre-popola il form con i dati dell'iscritto, gestendo i campi nidificati
      setFormData({
        ...iscritto,
        haCertificato: iscritto.certificatoMedico?.presente || false,
        scadenzaCertificato: iscritto.certificatoMedico?.scadenza || "",
        scadenzaAbbonamento: iscritto.abbonamento?.scadenza || "",
        // Nuovi campi
        livello: iscritto.livello || "",
        categoria: iscritto.categoria || "",
        // INIZIO NUOVI CAMPI CELLULARE
        // Fallback per vecchi dati che avevano solo 'cellulare'
        cellulare1: iscritto.cellulare1 || iscritto.cellulare || "", 
        cellulare1Tipo: iscritto.cellulare1Tipo || "Mamma",
        cellulare2: iscritto.cellulare2 || "",
        cellulare2Tipo: iscritto.cellulare2Tipo || "",
        // FINE NUOVI CAMPI CELLULARE
      });
    }
  }, [iscritto, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    // Riorganizza i dati nella struttura corretta per Firebase prima di salvare
    const {
      haCertificato,
      scadenzaCertificato,
      scadenzaAbbonamento,
      livello,
      categoria,
      cellulare, // Rimuovi il vecchio campo 'cellulare'
      cellulare1,
      cellulare1Tipo,
      cellulare2,
      cellulare2Tipo,
      ...rest
    } = formData;
    
    // Logica per non salvare campi cellulare vuoti
    const finalCellulare2 = cellulare2 || null;
    const finalCellulare2Tipo = finalCellulare2 ? (cellulare2Tipo || "Altro") : null;
    
    const dataToSave = {
      ...rest,
      certificatoMedico: {
        presente: haCertificato,
        scadenza: scadenzaCertificato,
      },
      abbonamento: { scadenza: scadenzaAbbonamento },
      livello, 
      categoria,
      // SALVA NUOVI CAMPI
      cellulare1,
      cellulare1Tipo,
      cellulare2: finalCellulare2,
      cellulare2Tipo: finalCellulare2Tipo,
    };
    onSave(dataToSave);
  };

  if (!iscritto) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Modifica Dati: {iscritto.nome} {iscritto.cognome}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          {/* 1. SEZIONE ANAGRAFICA BASE */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Dati Anagrafici Base
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="nome"
                  label="Nome"
                  value={formData.nome || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="cognome"
                  label="Cognome"
                  value={formData.cognome || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="luogoNascita"
                  label="Luogo di Nascita"
                  value={formData.luogoNascita || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="dataNascita"
                  label="Data di Nascita"
                  type="date"
                  value={formData.dataNascita || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="codiceFiscale"
                  label="Codice Fiscale Atleta"
                  value={formData.codiceFiscale || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="codiceAssicurazione"
                  label="Codice Assicurazione"
                  value={formData.codiceAssicurazione || ""}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* 2. SEZIONE INDIRIZZO E CONTATTI */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Indirizzo e Contatti
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="via"
                  label="Indirizzo (Via / Piazza)"
                  value={formData.via || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="numeroCivico"
                  label="N. Civico"
                  value={formData.numeroCivico || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="residenza"
                  label="Città di Residenza"
                  value={formData.residenza || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="cap"
                  label="CAP"
                  value={formData.cap || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="email"
                  label="Email"
                  value={formData.email || ""}
                  onChange={handleChange}
                />
              </Grid>
              
              {/* INIZIO NUOVI CAMPI CELLULARE 1 */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="cellulare1"
                  label="Cellulare 1"
                  value={formData.cellulare1 || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth margin="dense">
                  <InputLabel shrink={true}>Tipo 1</InputLabel>
                  <Select
                    name="cellulare1Tipo"
                    label="Tipo 1"
                    value={formData.cellulare1Tipo || "Mamma"}
                    onChange={handleChange}
                  >
                    {TIPI_CELLULARE.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* FINE NUOVI CAMPI CELLULARE 1 */}
              
              {/* INIZIO NUOVI CAMPI CELLULARE 2 */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="cellulare2"
                  label="Cellulare 2 (Opzionale)"
                  value={formData.cellulare2 || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth margin="dense">
                  <InputLabel shrink={true}>Tipo 2</InputLabel>
                  <Select
                    name="cellulare2Tipo"
                    label="Tipo 2"
                    value={formData.cellulare2Tipo || ""}
                    onChange={handleChange}
                    displayEmpty
                  >
                     <MenuItem value="">
                        <em>N/D</em>
                      </MenuItem>
                    {TIPI_CELLULARE.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* FINE NUOVI CAMPI CELLULARE 2 */}
            </Grid>
          </Grid>

          {/* 3. SEZIONE GRUPPO E LIVELLO - FIX SIZING */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Dati Tecnici e Quote
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {/* NUOVI CAMPI LIVELLO E CATEGORIA (sm=6 per larghezza maggiore) */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel shrink={true}>Livello</InputLabel>
                  <Select
                    name="livello"
                    label="Livello"
                    value={formData.livello || ""}
                    onChange={handleChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Seleziona Livello
                    </MenuItem>
                    {LIVELLI.map((lvl) => (
                      <MenuItem key={lvl} value={lvl}>
                        {lvl}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel shrink={true}>Categoria</InputLabel>
                  <Select
                    name="categoria"
                    label="Categoria"
                    value={formData.categoria || ""}
                    onChange={handleChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Seleziona Categoria
                    </MenuItem>
                    {CATEGORIE.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="quotaIscrizione"
                  label="Quota Iscrizione (€)"
                  type="number"
                  value={formData.quotaIscrizione || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="quotaMensile"
                  label="Quota Mensile Prevista (€)"
                  type="number"
                  value={formData.quotaMensile || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel shrink={true}>Sede</InputLabel>
                  <Select
                    name="sede"
                    label="Sede"
                    value={formData.sede || "Frascati"}
                    onChange={handleChange}
                  >
                    <MenuItem value="Frascati">Frascati</MenuItem>
                    <MenuItem value="Rocca Priora">Rocca Priora</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="scadenzaAbbonamento"
                  label="Scadenza Abbonamento"
                  type="date"
                  value={formData.scadenzaAbbonamento || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* 4. SEZIONE CERTIFICATO E NOTE */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Certificato e Annotazioni
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="haCertificato"
                      checked={formData.haCertificato || false}
                      onChange={handleChange}
                    />
                  }
                  label="Certificato Medico Presente"
                />
              </Grid>
              {formData.haCertificato && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    name="scadenzaCertificato"
                    label="Scadenza Certificato"
                    type="date"
                    value={formData.scadenzaCertificato || ""}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="annotazioni"
                  label="Annotazioni Segreteria"
                  multiline
                  rows={3}
                  value={formData.annotazioni || ""}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* 5. SEZIONE DATI GENITORE (Se Minore) */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Dati Genitore/Responsabile
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="nomeGenitore"
                  label="Cognome e Nome Genitore"
                  value={formData.nomeGenitore || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="cfGenitore"
                  label="Codice Fiscale Genitore"
                  value={formData.cfGenitore || ""}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Salva Modifiche
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IscrittoEditDialog;