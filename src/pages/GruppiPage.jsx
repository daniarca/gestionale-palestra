// src/pages/GruppiPage.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Grid,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import GestisciMembriDialog from "../components/GestisciMembriDialog.jsx";
import GruppoEditDialog from "../components/GruppoEditDialog.jsx";
import { giorniSettimana, orari } from "../utils/timeSlots.js";

function GruppiPage({ iscrittiList }) {
  const [gruppi, setGruppi] = useState([]);
  const [staff, setStaff] = useState([]);
  const [formOpen, setFormOpen] = useState(false);

  const [nomeGruppo, setNomeGruppo] = useState("");
  const [descrizioneGruppo, setDescrizioneGruppo] = useState("");
  const [staffSelezionato, setStaffSelezionato] = useState("");

  // Nuovo: slots per la creazione (array di {giorno, oraInizio, oraFine})
  const [slots, setSlots] = useState([{ giorno: "", oraInizio: "", oraFine: "" }]);

  const [membriDialogOpen, setMembriDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [gruppoSelezionato, setGruppoSelezionato] = useState(null);

  const fetchData = async () => {
    try {
      const gruppiQuery = query(collection(db, "gruppi"), orderBy("nome"));
      const staffQuery = query(collection(db, "staff"), orderBy("cognome"));
      const [gruppiSnapshot, staffSnapshot] = await Promise.all([
        getDocs(gruppiQuery),
        getDocs(staffQuery),
      ]);
      setGruppi(
        gruppiSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setStaff(
        staffSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Errore caricamento dati: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Slot helpers
  const handleAddSlot = () => {
    setSlots((s) => [...s, { giorno: "", oraInizio: "", oraFine: "" }]);
  };

  const handleRemoveSlot = (index) => {
    setSlots((s) => s.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    setSlots((s) => {
      const copy = [...s];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleCreaGruppo = async (e) => {
    e.preventDefault();
    if (!nomeGruppo) return;
    const allenatore = staff.find((s) => s.id === staffSelezionato);
    try {
      // Conserviamo solo slot validi (tutti e tre i campi)
      const validSlots = slots.filter((s) => s.giorno && s.oraInizio && s.oraFine);

      // Se non abbiamo alcuno slot valido ma esistevano i vecchi campi (compatibilità), non creiamo slot vuoti
      await addDoc(collection(db, "gruppi"), {
        nome: nomeGruppo,
        descrizione: descrizioneGruppo,
        membri: [],
        staffId: allenatore?.id || null,
        staffNome: allenatore
          ? `${allenatore.cognome} ${allenatore.nome}`
          : "Nessuno",
        // Salviamo l'array slots (può essere vuoto)
        slots: validSlots,
        sede: allenatore?.sede || "N/D",
      });

      // reset form
      setNomeGruppo("");
      setDescrizioneGruppo("");
      setStaffSelezionato("");
      setSlots([{ giorno: "", oraInizio: "", oraFine: "" }]);
      setFormOpen(false);
      fetchData();
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  const handleUpdateGruppo = async (updatedGruppo) => {
    // updatedGruppo è quello restituito dal dialog di editing: dovrebbe contenere slots
    const allenatore = staff.find((s) => s.id === updatedGruppo.staffId);
    const datiDaSalvare = {
      ...updatedGruppo,
      staffNome: allenatore
        ? `${allenatore.cognome} ${allenatore.nome}`
        : "Nessuno",
    };
    try {
      const gruppoRef = doc(db, "gruppi", updatedGruppo.id);
      await updateDoc(gruppoRef, datiDaSalvare);
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  const handleEliminaGruppo = async (id) => {
    if (!window.confirm("Sei sicuro?")) return;
    try {
      await deleteDoc(doc(db, "gruppi", id));
      fetchData();
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  const handleOpenMembriDialog = (gruppo) => {
    setGruppoSelezionato(gruppo);
    setMembriDialogOpen(true);
  };

  const handleOpenEditDialog = (gruppo) => {
    setGruppoSelezionato(gruppo);
    setEditDialogOpen(true);
  };

  const handleSalvaMembri = async (gruppoId, nuoviMembriIds) => {
    try {
      const gruppoRef = doc(db, "gruppi", gruppoId);
      await updateDoc(gruppoRef, { membri: nuoviMembriIds });
      setMembriDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  // helper per mostrare gli slot in linea (es. "Lun 19:00-20:00, Sab 10:00-11:30")
  const renderSlotsInline = (gruppo) => {
    const groupSlots = Array.isArray(gruppo.slots) && gruppo.slots.length > 0
      ? gruppo.slots
      : // compatibilità: se non ci sono slots, proviamo a ricostruire da vecchi campi giorno/ora
        (gruppo.giornoSettimana && (gruppo.oraInizio || gruppo.oraFine)
          ? [{ giorno: gruppo.giornoSettimana || "", oraInizio: gruppo.oraInizio || "", oraFine: gruppo.oraFine || "" }]
          : []);

    return groupSlots
      .map((s) => {
        const giornoLabel = giorniSettimana.find((g) => g.value === s.giorno)?.label || s.giorno || "";
        const inizio = s.oraInizio || "";
        const fine = s.oraFine || "";
        return `${giornoLabel} ${inizio}${inizio && "-" && fine ? "-" : ""}${fine ? fine : ""}`.trim();
      })
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          backgroundColor: "background.paper",
          borderRadius: 4,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Gestione Gruppi
          </Typography>
          <Button
            variant="contained"
            startIcon={formOpen ? <CloseIcon /> : <AddCircleOutlineIcon />}
            onClick={() => setFormOpen(!formOpen)}
            sx={{ height: "40px" }}
          >
            {formOpen ? "Chiudi Form" : "Crea Gruppo"}
          </Button>
        </Box>

        <Collapse in={formOpen}>
          <Box component="form" onSubmit={handleCreaGruppo} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  label="Nome Gruppo"
                  value={nomeGruppo}
                  onChange={(e) => setNomeGruppo(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  label="Descrizione"
                  value={descrizioneGruppo}
                  onChange={(e) => setDescrizioneGruppo(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel shrink={true}>Allenatore</InputLabel>
                  <Select
                    label="Allenatore"
                    value={staffSelezionato}
                    onChange={(e) => setStaffSelezionato(e.target.value)}
                    displayEmpty
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

              {/* Slot dynamic */}
              {slots.map((slot, i) => (
                <React.Fragment key={i}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Giorno</InputLabel>
                      <Select
                        value={slot.giorno}
                        label="Giorno"
                        onChange={(e) => handleSlotChange(i, "giorno", e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Seleziona Giorno</em>
                        </MenuItem>
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
                      <InputLabel>Inizio</InputLabel>
                      <Select
                        value={slot.oraInizio}
                        label="Inizio"
                        onChange={(e) => handleSlotChange(i, "oraInizio", e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Orario Inizio</em>
                        </MenuItem>
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
                      <InputLabel>Fine</InputLabel>
                      <Select
                        value={slot.oraFine}
                        label="Fine"
                        onChange={(e) => handleSlotChange(i, "oraFine", e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Orario Fine</em>
                        </MenuItem>
                        {orari.map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={2} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button color="error" onClick={() => handleRemoveSlot(i)}>
                      Rimuovi
                    </Button>
                  </Grid>
                </React.Fragment>
              ))}

              <Grid item xs={12}>
                <Button onClick={handleAddSlot} startIcon={<AddCircleOutlineIcon />}>
                  + Aggiungi Slot
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained">
                  Salva Gruppo
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Elenco Gruppi */}
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <Typography variant="h6" gutterBottom>
          Elenco Gruppi ({gruppi.length})
        </Typography>
        <List>
          {gruppi.map((gruppo, index) => (
            <React.Fragment key={gruppo.id}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton onClick={() => handleOpenEditDialog(gruppo)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <Button size="small" onClick={() => handleOpenMembriDialog(gruppo)}>
                      Membri
                    </Button>
                    <IconButton onClick={() => handleEliminaGruppo(gruppo.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={gruppo.nome}
                  secondary={`Allenatore: ${gruppo.staffNome || "Nessuno"} | Orari: ${renderSlotsInline(gruppo)} | ${gruppo.membri?.length || 0} membri`}
                />
              </ListItem>
              {index < gruppi.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Dialogs */}
      <GestisciMembriDialog
        open={membriDialogOpen}
        onClose={() => setMembriDialogOpen(false)}
        onSave={handleSalvaMembri}
        gruppo={gruppoSelezionato}
        iscritti={iscrittiList}
      />
      <GruppoEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateGruppo}
        gruppo={gruppoSelezionato || {}}
        staff={staff}
      />
    </Box>
  );
}

export default GruppiPage;
