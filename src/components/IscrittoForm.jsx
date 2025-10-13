// File: src/components/IscrittoForm.jsx (VERSIONE CORRETTA)

import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { CodiceFiscaleUtils } from "@marketto/codice-fiscale-utils";
import belfioreConnector from "@marketto/belfiore-connector-embedded";
import { LIVELLI, CATEGORIE, TIPI_CELLULARE } from "../utils/constants.js";

const initialFormData = {
  nome: "",
  cognome: "",
  dataNascita: "",
  luogoNascita: "",
  provinciaNascita: "",
  sesso: "",
  residenza: "",
  cap: "",
  via: "",
  numeroCivico: "",
  cellulare1: "",
  cellulare1Tipo: "Mamma",
  cellulare2: "",
  cellulare2Tipo: "",
  email: "",
  codiceFiscale: "",
  fgiTessera: "",
  asiTessera: "",
  csenTessera: "",
  nomeGenitore: "",
  cfGenitore: "",
  annotazioni: "",
  haCertificato: false,
  scadenzaCertificato: "",
  scadenzaAbbonamento: "",
  sede: "Frascati",
  quotaIscrizione: "",
  quotaMensile: "",
  livello: "",
  categoria: "",
  isCalisthenics: false, // Aggiunto isCalisthenics qui
};

function IscrittoForm({ open, onClose, onIscrittoAggiunto }) {
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Correzione: Aggiunto type === "switch" per la variabile isCalisthenics
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" || type === "switch" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.cognome) {
      alert("Inserisci almeno nome e cognome.");
      return;
    }

    // Destruttura i campi che richiedono formattazione o trattamento speciale
    const {
      haCertificato,
      scadenzaCertificato,
      scadenzaAbbonamento,
      isCalisthenics,
      quotaIscrizione,
      quotaMensile,
      ...rest
    } = formData;

    const nuovoIscritto = {
      ...rest, // Includi tutti gli altri campi (nome, cognome, CF, email, ecc.)

      // Formatta i campi speciali
      cellulare2: formData.cellulare2 || null,
      cellulare2Tipo: formData.cellulare2
        ? formData.cellulare2Tipo || "Altro"
        : null,
      quotaIscrizione: parseFloat(quotaIscrizione) || 0,
      quotaMensile: parseFloat(quotaMensile) || 0,
      isCalisthenics: isCalisthenics, // Passa il booleano

      // Dati di sistema e strutturati
      stato: "attivo",
      dataIscrizione: new Date().toISOString().split("T")[0],
      certificatoMedico: {
        presente: haCertificato,
        scadenza: haCertificato ? scadenzaCertificato : null,
      },
      abbonamento: { scadenza: scadenzaAbbonamento },
    };

    onIscrittoAggiunto(nuovoIscritto);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleCalcolaCodiceFiscale = async () => {
    const {
      nome,
      cognome,
      dataNascita,
      sesso,
      luogoNascita,
      provinciaNascita,
    } = formData;
    if (
      !nome ||
      !cognome ||
      !dataNascita ||
      !sesso ||
      !luogoNascita ||
      !provinciaNascita
    ) {
      alert(
        "Per calcolare il codice fiscale, compila Nome, Cognome, Data, Sesso, Luogo e Provincia di Nascita."
      );
      return;
    }

    try {
      const [year, month, day] = dataNascita.split("-").map(Number);

      const cfUtils = new CodiceFiscaleUtils(belfioreConnector);

      const cf = await cfUtils.parser.encodeCf({
        firstName: nome.trim(),
        lastName: cognome.trim(),
        gender: sesso,
        day,
        month: month - 1, // month è 0-indexed in codice-fiscale-utils
        year,
        place: luogoNascita.trim(),
      });
      setFormData((prev) => ({ ...prev, codiceFiscale: cf }));
    } catch (error) {
      console.error("Errore nel calcolo del codice fiscale:", error);
      alert(
        `Non è stato possibile calcolare il codice fiscale. Assicurati che il comune ("${luogoNascita}") e la provincia ("${provinciaNascita}") di nascita siano scritti correttamente.`
      );
    }
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Nuova Iscrizione Socio</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Dati Anagrafici Base
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Nome *"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Cognome *"
                    name="cognome"
                    value={formData.cognome}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Luogo di Nascita"
                    name="luogoNascita"
                    value={formData.luogoNascita}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Prov."
                    name="provinciaNascita"
                    value={formData.provinciaNascita}
                    helperText="Es. RM"
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Data di Nascita"
                    name="dataNascita"
                    type="date"
                    value={formData.dataNascita}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Sesso</InputLabel>
                    <Select
                      name="sesso"
                      label="Sesso"
                      value={formData.sesso}
                      onChange={handleChange}
                    >
                      <MenuItem value="M">Maschio</MenuItem>
                      <MenuItem value="F">Femmina</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      variant="outlined"
                      label="Codice Fiscale Atleta"
                      name="codiceFiscale"
                      value={formData.codiceFiscale}
                      onChange={handleChange}
                    />
                    <IconButton
                      onClick={handleCalcolaCodiceFiscale}
                      color="primary"
                      title="Calcola Codice Fiscale"
                    >
                      <AutoFixHighIcon />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="FGI Numero Tessera"
                    name="fgiTessera"
                    value={formData.fgiTessera}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="ASI Numero Tessera"
                    name="asiTessera"
                    value={formData.asiTessera}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="CSEN Numero Tessera"
                    name="csenTessera"
                    value={formData.csenTessera}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Indirizzo e Contatti
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Indirizzo (Via / Piazza)"
                    name="via"
                    value={formData.via}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="N. Civico"
                    name="numeroCivico"
                    value={formData.numeroCivico}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Città di Residenza"
                    name="residenza"
                    value={formData.residenza}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="CAP"
                    name="cap"
                    value={formData.cap}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Cellulare 1"
                    name="cellulare1"
                    value={formData.cellulare1}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel shrink={true}>Tipo 1</InputLabel>
                    <Select
                      name="cellulare1Tipo"
                      label="Tipo 1"
                      value={formData.cellulare1Tipo}
                      onChange={handleChange}
                      displayEmpty
                    >
                      {TIPI_CELLULARE.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Cellulare 2 (Opzionale)"
                    name="cellulare2"
                    value={formData.cellulare2}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel shrink={true}>Tipo 2</InputLabel>
                    <Select
                      name="cellulare2Tipo"
                      label="Tipo 2"
                      value={formData.cellulare2Tipo}
                      onChange={handleChange}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        N/D
                      </MenuItem>
                      {TIPI_CELLULARE.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Dati Tecnici e Quote
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel shrink={true}>Livello</InputLabel>
                    <Select
                      name="livello"
                      label="Livello"
                      value={formData.livello}
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
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel shrink={true}>Categoria</InputLabel>
                    <Select
                      name="categoria"
                      label="Categoria"
                      value={formData.categoria}
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
                    size="small"
                    fullWidth
                    variant="outlined"
                    name="quotaIscrizione"
                    label="Quota Iscrizione (€)"
                    type="number"
                    value={formData.quotaIscrizione}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    name="quotaMensile"
                    label="Quota Mensile Prevista (€)"
                    type="number"
                    value={formData.quotaMensile}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel shrink={true}>Sede di Iscrizione</InputLabel>
                    <Select
                      name="sede"
                      label="Sede di Iscrizione"
                      value={formData.sede}
                      onChange={handleChange}
                    >
                      <MenuItem value="Frascati">Frascati</MenuItem>
                      <MenuItem value="Rocca Priora">Rocca Priora</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Scadenza Primo Abbonamento"
                    name="scadenzaAbbonamento"
                    type="date"
                    value={formData.scadenzaAbbonamento}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        // FIX APPLICATO QUI: usa formData.isCalisthenics
                        checked={formData.isCalisthenics}
                        // FIX APPLICATO QUI: usa la funzione handleChange
                        onChange={handleChange}
                        name="isCalisthenics"
                      />
                    }
                    label="Iscritto a Calisthenics"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Certificato e Annotazioni
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="haCertificato"
                        checked={formData.haCertificato}
                        onChange={handleChange}
                      />
                    }
                    label="Certificato Medico Presente"
                  />
                </Grid>
                {formData.haCertificato && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      size="small"
                      fullWidth
                      variant="outlined"
                      label="Scadenza Certificato Medico"
                      type="date"
                      name="scadenzaCertificato"
                      value={formData.scadenzaCertificato}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Annotazioni Segreteria"
                    multiline
                    rows={3}
                    name="annotazioni"
                    value={formData.annotazioni}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Dati Genitore/Responsabile
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Cognome e Nome Genitore"
                    name="nomeGenitore"
                    value={formData.nomeGenitore}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Codice Fiscale Genitore"
                    name="cfGenitore"
                    value={formData.cfGenitore}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={onClose}>Annulla</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            sx={{ height: "40px", color: "white" }}
          >
            Salva Iscrizione
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
export default IscrittoForm;
