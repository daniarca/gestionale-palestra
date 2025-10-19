// File: src/pages/SchedaSocioPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { useNotification } from "../context/NotificationContext.jsx";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Grid,
  Chip,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import IscrittoEditDialog from "../components/IscrittoEditDialog.jsx";
import AggiungiPagamentoDialog from "../components/AggiungiPagamentoDialog.jsx";
import StoricoPagamenti from "../components/StoricoPagamenti.jsx";
import PrintIcon from "@mui/icons-material/Print";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import logoImage from "../assets/logo.png";
import firmaImage from "../assets/firma.png";
import { generateReceipt } from "../utils/generateReceipt.js";
import {
  uploadFile,
  fetchDocumentsByIscrittoId,
  deleteFile,
} from "../services/firebaseService.js";
import FileUpload from "../components/FileUpload.jsx";
import DocumentList from "../components/DocumentList.jsx";
import moment from "moment";
import "moment/locale/it";

moment.locale("it");

function TabPanel(props) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function SchedaSocioPage({ onDataUpdate }) {
  const { iscrittoId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();

  const [iscritto, setIscritto] = useState(null);
  const [pagamenti, setPagamenti] = useState([]);
  const [documenti, setDocumenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isPagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);

  const fetchIscritto = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "iscritti", iscrittoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const iscrittoData = { id: docSnap.id, ...docSnap.data() };
        setIscritto(iscrittoData);

        const [pagamentiList, documentiList] = await Promise.all([
          getDocs(
            query(
              collection(db, "pagamenti"),
              where("iscrittoId", "==", iscrittoId)
            )
          ).then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
          fetchDocumentsByIscrittoId(iscrittoId),
        ]);
        setPagamenti(pagamentiList);
        setDocumenti(documentiList);
      } else {
        showNotification("Iscritto non trovato.", "error");
        navigate("/iscritti");
      }
    } catch (error) {
      console.error("Errore fetch: ", error);
      showNotification("Errore nel caricamento dei dati.", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIscritto();
  }, [iscrittoId]);

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      await uploadFile(file, iscrittoId);
      showNotification("File caricato con successo!", "success");
      fetchIscritto();
    } catch (error) {
      showNotification("Errore durante il caricamento.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (docId, filePath) => {
    if (
      !window.confirm(
        "Sei sicuro di voler eliminare questo documento? L'azione è irreversibile."
      )
    )
      return;
    try {
      await deleteFile(docId, filePath);
      showNotification("Documento eliminato.", "success");
      fetchIscritto();
    } catch (error) {
      showNotification("Errore durante l'eliminazione.", "error");
    }
  };

  const handleUpdateIscritto = async (updatedData) => {
    try {
      const iscrittoRef = doc(db, "iscritti", updatedData.id);
      await updateDoc(iscrittoRef, updatedData);
      showNotification("Dati aggiornati con successo.", "success");
      setEditDialogOpen(false);
      fetchIscritto();
      if (onDataUpdate) onDataUpdate();
    } catch (e) {
      showNotification("Errore durante l'aggiornamento.", "error");
    }
  };

  const handleArchiviaIscritto = async () => {
    if (
      !window.confirm(
        "Sei sicuro di voler archiviare questo iscritto? Potrà essere ripristino in seguito."
      )
    )
      return;
    try {
      const iscrittoRef = doc(db, "iscritti", iscrittoId);
      await updateDoc(iscrittoRef, { stato: "archiviato" });
      showNotification("Iscritto archiviato con successo.", "success");
      if (onDataUpdate) onDataUpdate();
      navigate("/iscritti");
    } catch (e) {
      showNotification("Errore durante l'archiviazione.", "error");
    }
  };

  const handleAggiungiPagamento = async (paymentData) => {
    if (!iscritto) return;
    const { cifra, tipo, mese, metodoPagamento } = paymentData;

    const nuovoPagamento = {
      iscrittoId: iscritto.id,
      iscrittoNome: `${iscritto.nome} ${iscritto.cognome}`,
      cifra: cifra,
      tipo: tipo,
      sede: iscritto.sede || "N/D",
      dataPagamento: moment().format("YYYY-MM-DD"),
      metodoPagamento: metodoPagamento,
    };

    if (tipo === "Quota Mensile") {
      nuovoPagamento.meseRiferimento = mese;
    }

    const iscrittoRef = doc(db, "iscritti", iscritto.id);
    let datiDaAggiornare = {};
    let alertMessage = `Pagamento di tipo "${tipo}" per ${cifra}€ registrato. Metodo: ${metodoPagamento}.`;

    if (tipo === "Quota Mensile") {
      const oggi = moment();
      const annoCorrente = oggi.year();
      const meseCorrente = oggi.month(); // mese corrente (0-11)

      // L'anno sportivo inizia a Settembre (mese 8).
      // Se il mese per cui si paga (mese) è da Gennaio ad Agosto (0-7)
      // e il mese corrente è da Settembre a Dicembre (8-11),
      // allora il pagamento si riferisce all'anno solare successivo.
      const annoRiferimento = (mese < 8 && meseCorrente > 7) ? annoCorrente + 1 : annoCorrente;

      const nuovaScadenzaDate = moment().year(annoRiferimento).month(mese).endOf('month');
      const nuovaScadenzaString = nuovaScadenzaDate.format("YYYY-MM-DD");

      datiDaAggiornare.abbonamento = {
        ...iscritto.abbonamento, // Mantiene eventuali dati pre-esistenti
        scadenza: nuovaScadenzaString,
        mesePagato: mese,
      };

      alertMessage = `Pagamento per il mese di ${nuovaScadenzaDate.format("MMMM")} registrato. Scadenza aggiornata al ${nuovaScadenzaDate.format(
        "DD/MM/YYYY"
      )}. Metodo: ${metodoPagamento}.`;
    } else if (tipo === "Iscrizione" || tipo === "Quota Iscrizione") {
      const quotaIscrizionePrecedente =
        parseFloat(iscritto.quotaIscrizione) || 0;
      const importoPagato = parseFloat(cifra) || 0;
      datiDaAggiornare.quotaIscrizione =
        quotaIscrizionePrecedente + importoPagato;
      alertMessage = `Pagamento di Iscrizione/Annuale registrato per ${importoPagato.toFixed(
        2
      )}€. Totale versato: ${datiDaAggiornare.quotaIscrizione.toFixed(
        2
      )}€. Metodo: ${metodoPagamento}.`;
    }

    try {
      await addDoc(collection(db, "pagamenti"), nuovoPagamento);
      if (Object.keys(datiDaAggiornare).length > 0) {
        await updateDoc(iscrittoRef, datiDaAggiornare);
      }
      showNotification(alertMessage, "success");
      setPagamentoDialogOpen(false);
      fetchIscritto();
      if (onDataUpdate) onDataUpdate();
    } catch (e) {
      console.error("Errore durante la registrazione del pagamento: ", e);
      showNotification(
        "Errore durante la registrazione del pagamento.",
        "error"
      );
    }
  };

  const handleEliminaIscritto = async () => {
    if (
      !window.confirm(
        "ATTENZIONE: Stai per eliminare definitivamente questo iscritto e tutti i suoi dati. L'azione è irreversibile. Continuare?"
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "iscritti", iscrittoId));
      showNotification("Iscritto eliminato definitivamente.", "warning");
      if (onDataUpdate) onDataUpdate();
      navigate("/iscritti");
    } catch (e) {
      showNotification("Errore durante l'eliminazione.", "error");
    }
  };

  const handleStampaRicevuta = () => {
    generateReceipt(iscritto, pagamenti, logoImage, firmaImage);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/D";
    return moment(dateString).format("DD/MM/YYYY");
  };

  const getMonthName = (monthIndex) => {
    if (monthIndex == null || monthIndex === "") return "N/D";
    return (
      moment().month(monthIndex).format("MMMM").charAt(0).toUpperCase() +
      moment().month(monthIndex).format("MMMM").slice(1)
    );
  };

  // Funzione helper per renderizzare i cellulari
  const renderCellulare = (numero, tipo) => {
    if (!numero) return null;
    return (
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography>
          <strong>{tipo || "Contatto"}:</strong>
        </Typography>
        <Chip label={numero} size="small" color="primary" variant="outlined" />
      </Box>
    );
  };

  const getSubscriptionStatus = (scadenza) => {
    if (!scadenza) {
      return { text: "Non Attivo", color: "default" };
    }
    const oggi = moment();
    const scadenzaDate = moment(scadenza);

    if (scadenzaDate.isSameOrAfter(oggi, "day")) {
      return { text: "Attivo", color: "success" };
    }
    // Se oggi è dopo la scadenza, ma entro i 7 giorni di tolleranza
    if (scadenzaDate.clone().add(7, "days").isSameOrAfter(oggi, "day")) {
      return { text: "In Tolleranza", color: "warning" };
    }
    // Se sono passati più di 7 giorni dalla scadenza
    return { text: "Scaduto", color: "error" };
  };



  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (!iscritto) return <Typography>Iscritto non trovato.</Typography>;

  const subscriptionStatus = getSubscriptionStatus(iscritto.abbonamento?.scadenza);

  const backButtonColor =
    theme.palette.mode === "light"
      ? theme.palette.text.primary
      : theme.palette.text.secondary;

  return (
    <>
      <Button
        component={RouterLink}
        to="/iscritti"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: backButtonColor }}
      >
        Torna alla Lista Iscritti
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
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
            >
              {iscritto.nome} {iscritto.cognome}
            </Typography>
            <Typography color="text.secondary">
              {iscritto.codiceFiscale}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="info"
              startIcon={<PrintIcon />}
              onClick={handleStampaRicevuta}
            >
              Stampa Ricevuta
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ color: "white" }}
            >
              Modifica Dati
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<ArchiveIcon />}
              onClick={handleArchiviaIscritto}
            >
              Archivia
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={handleEliminaIscritto}
            >
              Elimina
            </Button>
          </Stack>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Generale" sx={{ fontWeight: "bold" }} />
            <Tab label="Contatti" sx={{ fontWeight: "bold" }} />
            <Tab
              label="Dati Sanitari e Tesseramento"
              sx={{ fontWeight: "bold" }}
            />
            <Tab label="Pagamenti" sx={{ fontWeight: "bold" }} />
            <Tab label="Documenti" sx={{ fontWeight: "bold" }} />
          </Tabs>
        </Box>

        {/* TabPanel 0: Generale */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Dati Anagrafici
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Nato/a il:</strong> {formatDate(iscritto.dataNascita)} a{" "}
                {iscritto.luogoNascita || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Sede:</strong> {iscritto.sede || "N/D"}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Stato Abbonamento
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Scadenza:</strong>{" "}
                {formatDate(iscritto.abbonamento?.scadenza)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Chip label={subscriptionStatus.text} color={subscriptionStatus.color} sx={{ fontWeight: 'bold' }} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Dati Familiari
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Genitore:</strong> {iscritto.nomeGenitore || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>CF Genitore:</strong> {iscritto.cfGenitore || "N/D"}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Note Segreteria
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[50]
                  : theme.palette.background.default,
            }}
          >
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {iscritto.annotazioni || "Nessuna nota."}
            </Typography>
          </Paper>
        </TabPanel>

        {/* TabPanel 1: Contatti */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Indirizzo e Contatti
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography>
                <strong>Residenza:</strong>{" "}
                {`${iscritto.via || ""} ${iscritto.numeroCivico || ""}, ${
                  iscritto.cap || ""
                } ${iscritto.residenza || ""}`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Email:</strong> {iscritto.email || "N/D"}
              </Typography>
            </Grid>
          </Grid>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", mb: 1, mt: 3 }}
          >
            Contatti Telefonici
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {renderCellulare(iscritto.cellulare1, iscritto.cellulare1Tipo)}
          {renderCellulare(iscritto.cellulare2, iscritto.cellulare2Tipo)}
          {!iscritto.cellulare1 && !iscritto.cellulare2 && (
            <Typography color="text.secondary">
              Nessun numero di cellulare registrato.
            </Typography>
          )}
        </TabPanel>

        {/* TabPanel 2: Dati Sanitari e Tesseramento */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Dati Sanitari
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Chip
                color={
                  iscritto.certificatoMedico?.presente ? "success" : "error"
                }
                label={
                  iscritto.certificatoMedico?.presente
                    ? "Certificato Presente"
                    : "Certificato Mancante"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Scadenza Certificato:</strong>{" "}
                {formatDate(iscritto.certificatoMedico?.scadenza)}
              </Typography>
            </Grid>
          </Grid>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", mb: 1, mt: 3 }}
          >
            Tesseramento
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
              <Typography>
                <strong>FGI Numero Tessera:</strong>{" "}
                {iscritto.fgiTessera || iscritto.codiceTesseramento1 || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>
                <strong>ASI Numero Tessera:</strong>{" "}
                {iscritto.asiTessera || iscritto.codiceTesseramento2 || "N/D"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>
                <strong>CSEN Numero Tessera:</strong>{" "}
                {iscritto.csenTessera || iscritto.codiceTesseramento3 || "N/D"}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TabPanel 3: Pagamenti */}
        <TabPanel value={tabValue} index={3}>
          <Button
            onClick={() => setPagamentoDialogOpen(true)}
            variant="contained"
            color="success"
            sx={{ mb: 2 }}
          >
            Aggiungi Pagamento
          </Button>
          <StoricoPagamenti
            pagamenti={pagamenti}
            quotaMensile={iscritto.quotaMensile}
            quotaIscrizione={iscritto.quotaIscrizione}
          />
        </TabPanel>

        {/* TabPanel 4: Documenti */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Gestione Documentale
          </Typography>
          <FileUpload onUpload={handleFileUpload} isLoading={uploading} />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Documenti Caricati
          </Typography>
          <DocumentList documents={documenti} onDelete={handleFileDelete} />
        </TabPanel>
      </Paper>

      <IscrittoEditDialog
        iscritto={iscritto}
        open={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateIscritto}
      />
      <AggiungiPagamentoDialog
        open={isPagamentoDialogOpen}
        onClose={() => setPagamentoDialogOpen(false)}
        onSave={handleAggiungiPagamento}
        iscritto={iscritto}
      />
    </>
  );
}

export default SchedaSocioPage;
