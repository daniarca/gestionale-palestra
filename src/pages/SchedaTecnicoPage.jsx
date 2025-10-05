// File: src/pages/SchedaTecnicoPage.jsx (AGGIORNATO)

import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useNotification } from "../context/NotificationContext.jsx";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Grid,
  Divider,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import TecnicoEditDialog from "../components/TecnicoEditDialog.jsx";
import FileUpload from "../components/FileUpload.jsx";
import DocumentList from "../components/DocumentList.jsx";
import {
  updateTecnico,
  deleteTecnico,
  uploadTecnicoFile,
  fetchTecnicoDocuments,
  deleteTecnicoFile,
} from "../services/firebaseService.js";
import moment from "moment";
import "moment/locale/it";

moment.locale("it");

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function SchedaTecnicoPage() {
  const { tecnicoId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [tecnico, setTecnico] = useState(null);
  const [documenti, setDocumenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // FUNZIONE DI FETCH CORRETTA PER IL TECNICO
  const fetchTecnico = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "staff", tecnicoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTecnico({ id: docSnap.id, ...docSnap.data() });

        // Qui carichiamo SOLO i documenti del tecnico
        const docs = await fetchTecnicoDocuments(tecnicoId);
        setDocumenti(docs);
      } else {
        showNotification("Tecnico non trovato.", "error");
        navigate("/tecnici");
      }
    } catch (error) {
      console.error(
        "Errore dettagliato nel caricamento dati del tecnico:",
        error
      );
      // Mostra un messaggio più generico se fallisce l'intera fetch
      showNotification("Errore nel caricamento dei dati.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tecnicoId) {
      fetchTecnico();
    }
  }, [tecnicoId]);

  const handleUpdateTecnico = async (data) => {
    try {
      await updateTecnico(data);
      showNotification("Dati aggiornati.", "success");
      setEditDialogOpen(false);
      fetchTecnico();
    } catch {
      showNotification("Errore durante l'aggiornamento.", "error");
    }
  };

  const handleDeleteTecnico = async () => {
    if (!window.confirm("ATTENZIONE: L'azione è irreversibile. Continuare?"))
      return;
    try {
      await deleteTecnico(tecnicoId);
      showNotification("Tecnico eliminato.", "warning");
      navigate("/tecnici");
    } catch {
      showNotification("Errore durante l'eliminazione.", "error");
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      await uploadTecnicoFile(file, tecnicoId);
      showNotification("File caricato!", "success");
      fetchTecnico();
    } catch {
      showNotification("Errore durante il caricamento.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (docId, filePath) => {
    if (!window.confirm("Eliminare questo documento?")) return;
    try {
      await deleteTecnicoFile(docId, filePath);
      showNotification("Documento eliminato.", "success");
      fetchTecnico();
    } catch {
      showNotification("Errore durante l'eliminazione.", "error");
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  // Se la fetch fallisce ma non è in loading, mostriamo il messaggio di fallback
  if (!tecnico)
    return <Typography>Dettagli tecnico non disponibili.</Typography>;

  return (
    <>
      <Button
        component={RouterLink}
        to="/tecnici"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Torna alla Lista Tecnici
      </Button>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {tecnico.nome || "Nome Mancante"}{" "}
              {tecnico.cognome || "Cognome Mancante"}
            </Typography>
            <Typography color="text.secondary" variant="h6">
              {tecnico.ruolo || "Ruolo N/D"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
            >
              Modifica
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={handleDeleteTecnico}
            >
              Elimina
            </Button>
          </Stack>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab label="Anagrafica" />
            <Tab label="Contatti" />
            <Tab label="Documenti" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Nato/a il:</strong>{" "}
                {tecnico.dataNascita
                  ? moment(tecnico.dataNascita).format("DD/MM/YYYY")
                  : "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>A:</strong> {tecnico.luogoNascita || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Codice Fiscale:</strong>{" "}
                {tecnico.codiceFiscale || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Numero Tessera:</strong>{" "}
                {tecnico.numeroTessera || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Documento d'Identità:</strong>{" "}
                {tecnico.numeroDocumento || "N/D"}
              </Typography>
            </Grid>
            {/* NUOVO CAMPO: Paga Oraria */}
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Paga Oraria:</strong>{" "}
                {tecnico.pagaOraria !== undefined
                  ? `${parseFloat(tecnico.pagaOraria).toFixed(2)}€`
                  : "N/D"}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Cellulare:</strong> {tecnico.cellulare || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Email:</strong> {tecnico.email || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <strong>Residenza:</strong>{" "}
                {/* Residenza e indirizzo più robusti */}
                {`${tecnico.via || "N/D"}${
                  tecnico.via && tecnico.numeroCivico
                    ? `, ${tecnico.numeroCivico}`
                    : ""
                }, ${tecnico.cap || "N/D"} ${tecnico.residenza || "N/D"} (${
                  tecnico.provincia || "N/D"
                })`}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <FileUpload onUpload={handleFileUpload} isLoading={uploading} />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Documenti Caricati
          </Typography>
          <DocumentList documents={documenti} onDelete={handleFileDelete} />
        </TabPanel>
      </Paper>

      {isEditDialogOpen && (
        <TecnicoEditDialog
          open={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleUpdateTecnico}
          tecnico={tecnico}
        />
      )}
    </>
  );
}

export default SchedaTecnicoPage;