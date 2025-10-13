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
  IconButton,
  Box,
  Switch,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

// === Importazione corretta per i Constants ===
import { LIVELLI, CATEGORIE, TIPI_CELLULARE } from "../utils/constants.js";

// === SOLUZIONE ALL'ERRORE: CAMBIARE IL TIPO DI IMPORTAZIONE ===
// 1. Usiamo l'import di default (senza {}) per BelfioreConnectorEmbedded.
import BelfioreConnectorEmbedded from "@marketto/belfiore-connector-embedded";
// 2. Usiamo l'import di default anche per CodiceFiscaleUtils (per sicurezza).
import CodiceFiscaleUtils from "@marketto/codice-fiscale-utils"; 
// =============================================================

// Variabile esterna per l'istanza globale e per evitare ricalcoli
let codiceFiscaleInstance = null; 

function IscrittoEditDialog({ iscritto, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  // Stato per gestire il caricamento della libreria CF
  const [isCfReady, setIsCfReady] = useState(false);

  // === Effetto di Inizializzazione Asincrona della Libreria CF ===
  useEffect(() => {
    async function initCodiceFiscale() {
      if (!codiceFiscaleInstance) {
        try {
          // Creazione dell'istanza del database dei comuni (Connettore Belfiore)
          const belfioreConnector = new BelfioreConnectorEmbedded();
          
          // Inizializzazione della libreria principale con il connettore
          codiceFiscaleInstance = new CodiceFiscaleUtils(belfioreConnector);
          
          // Potenziale attesa per l'inizializzazione del connettore (precauzione)
          if (belfioreConnector.ready) { 
              await belfioreConnector.ready;
          }

          setIsCfReady(true);
        } catch (e) {
          console.error("ERRORE CRITICO: Impossibile inizializzare CodiceFiscaleUtils", e);
          // In caso di errore, assicurati che la funzionalità sia disabilitata
          setIsCfReady(false);
        }
      } else {
        setIsCfReady(true);
      }
    }
    initCodiceFiscale();
  }, []);
  // ===============================================================

  useEffect(() => {
    if (iscritto) {
      setFormData({
        ...iscritto,
        haCertificato: iscritto.certificatoMedico?.presente || false,
        scadenzaCertificato: iscritto.certificatoMedico?.scadenza || "",
        provinciaNascita: iscritto.provinciaNascita || "",
        sesso: iscritto.sesso || "",
        scadenzaAbbonamento: iscritto.abbonamento?.scadenza || "",
        livello: iscritto.livello || "",
        categoria: iscritto.categoria || "",
        fgiTessera: iscritto.fgiTessera || iscritto.codiceTesseramento1 || iscritto.codiceAssicurazione || "",
        asiTessera: iscritto.asiTessera || iscritto.codiceTesseramento2 || "",
        csenTessera: iscritto.csenTessera || iscritto.codiceTesseramento3 || "",
        cellulare1: iscritto.cellulare1 || iscritto.cellulare || "",
        cellulare1Tipo: iscritto.cellulare1Tipo || "Mamma",
        cellulare2: iscritto.cellulare2 || "",
        cellulare2Tipo: iscritto.cellulare2Tipo || "",
        isCalisthenics: iscritto.isCalisthenics || false,
      });
    }
  }, [iscritto, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Lo Switch di MUI non ha type='checkbox', quindi gestiamo il suo valore 'checked' separatamente.
    const finalValue = name === 'isCalisthenics' 
      ? checked 
      : (type === "checkbox" ? checked : value);

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSave = () => {
    const {
      haCertificato,
      scadenzaCertificato,
      scadenzaAbbonamento,
      livello,
      categoria,
      quotaIscrizione,
      quotaMensile,
      codiceAssicurazione,
      fgiTessera,
      asiTessera,
      csenTessera,
      cellulare,
      cellulare1,
      cellulare1Tipo,
      cellulare2,
      cellulare2Tipo,
      isCalisthenics,
      ...rest
    } = formData;

    const finalCellulare2 = cellulare2 || null;
    const finalCellulare2Tipo = finalCellulare2
      ? cellulare2Tipo || "Altro"
      : null;

    const dataToSave = {
      ...rest,
      certificatoMedico: {
        presente: haCertificato,
        scadenza: scadenzaCertificato,
      },
      abbonamento: { scadenza: scadenzaAbbonamento },
      livello,
      categoria,
      quotaIscrizione: parseFloat(quotaIscrizione) || 0,
      quotaMensile: parseFloat(quotaMensile) || 0,
      fgiTessera,
      asiTessera,
      csenTessera,
      cellulare1,
      cellulare1Tipo,
      cellulare2: finalCellulare2,
      cellulare2Tipo: finalCellulare2Tipo,
      isCalisthenics: isCalisthenics, // <-- ECCO LA CORREZIONE!
    };
    onSave(dataToSave);
  };

  const handleCalcolaCodiceFiscale = async () => {
    // Blocco di controllo: verifica che la libreria sia pronta
    if (!isCfReady || !codiceFiscaleInstance) {
        alert("La funzionalità di calcolo del Codice Fiscale non è ancora pronta. Attendi o controlla gli errori nella console.");
        return;
    }

    const { nome, cognome, dataNascita, sesso, luogoNascita, provinciaNascita } =
      formData;
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
      // dataNascita è garantita dal type="date" essere "YYYY-MM-DD"
      const [year, month, day] = dataNascita.split("-").map(Number);

      // Chiama il metodo compute sull'istanza inizializzata
      const cf = await codiceFiscaleInstance.compute({
        // Pulizia e normalizzazione degli input per la libreria
        name: nome.trim(),
        surname: cognome.trim(),
        gender: sesso,
        day,
        month, 
        year,
        birthplace: luogoNascita.trim().toUpperCase(),
        birthplaceProvincia: provinciaNascita.trim().toUpperCase(),
      });
      setFormData((prev) => ({ ...prev, codiceFiscale: cf }));
    } catch (error) {
      console.error("Errore nel calcolo del codice fiscale:", error);
      alert(
        `Non è stato possibile calcolare il codice fiscale. Assicurati che il comune ("${luogoNascita}") e la provincia ("${provinciaNascita}") di nascita siano scritti correttamente.`
      );
    }
  };

  if (!iscritto) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Modifica Dati: {iscritto.nome} {iscritto.cognome}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="luogoNascita"
                  label="Luogo di Nascita"
                  value={formData.luogoNascita || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="provinciaNascita"
                  label="Prov."
                  value={formData.provinciaNascita || ""}
                  helperText="Es. RM"
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
                <FormControl fullWidth margin="dense">
                  <InputLabel>Sesso</InputLabel>
                  <Select
                    name="sesso"
                    label="Sesso"
                    value={formData.sesso || ""}
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
                    fullWidth
                    margin="dense"
                    name="codiceFiscale"
                    label="Codice Fiscale Atleta"
                    value={formData.codiceFiscale || ""}
                    onChange={handleChange}
                  />
                  <IconButton
                    onClick={handleCalcolaCodiceFiscale}
                    color="primary"
                    title={isCfReady ? "Calcola Codice Fiscale" : "Caricamento in corso..."}
                    // Disabilita il pulsante finché la libreria non è pronta
                    disabled={!isCfReady} 
                  >
                    <AutoFixHighIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="fgiTessera"
                  label="FGI Numero Tessera"
                  value={formData.fgiTessera || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="asiTessera"
                  label="ASI Numero Tessera"
                  value={formData.asiTessera || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="csenTessera"
                  label="CSEN Numero Tessera"
                  value={formData.csenTessera || ""}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>

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
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Dati Tecnici e Quote
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
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
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isCalisthenics || false}
                      onChange={handleChange} // Ora gestito correttamente
                      name="isCalisthenics"
                    />
                  }
                  label="Iscritto a Calisthenics"
                />
              </Grid>
            </Grid>
          </Grid>

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