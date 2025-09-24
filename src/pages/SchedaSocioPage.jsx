// File: src/pages/SchedaSocioPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress, Button, Grid, Chip, Divider, Stack, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import IscrittoEditDialog from '../components/IscrittoEditDialog.jsx';
import AggiungiPagamentoDialog from '../components/AggiungiPagamentoDialog.jsx';
import StoricoPagamenti from '../components/StoricoPagamenti.jsx';
import PrintIcon from '@mui/icons-material/Print';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import logoImage from '../assets/logo.png';
import firmaImage from '../assets/firma.png';
import { generateReceipt } from '../utils/generateReceipt.js';
import { uploadFile, fetchDocumentsByIscrittoId, deleteFile } from '../services/firebaseService.js';
import FileUpload from '../components/FileUpload.jsx';
import DocumentList from '../components/DocumentList.jsx';

function TabPanel(props) {
  const { children, value, index } = props;
  return (<div role="tabpanel" hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>);
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
          getDocs(query(collection(db, "pagamenti"), where("iscrittoId", "==", iscrittoId))).then(snap => snap.docs.map(d => d.data())),
          fetchDocumentsByIscrittoId(iscrittoId),
        ]);
        setPagamenti(pagamentiList);
        setDocumenti(documentiList);
        
      } else {
        showNotification("Iscritto non trovato.", "error");
        navigate('/iscritti');
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
    if (!window.confirm("Sei sicuro di voler eliminare questo documento? L'azione è irreversibile.")) return;
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
      showNotification("Dati aggiornati con successo.", 'success');
      setEditDialogOpen(false);
      fetchIscritto();
      if (onDataUpdate) onDataUpdate();
    } catch (e) { showNotification("Errore durante l'aggiornamento.", 'error'); }
  };
  
  const handleArchiviaIscritto = async () => {
    if (!window.confirm("Sei sicuro di voler archiviare questo iscritto? Potrà essere ripristinato in seguito.")) return;
    try {
      const iscrittoRef = doc(db, "iscritti", iscrittoId);
      await updateDoc(iscrittoRef, { stato: "archiviato" });
      showNotification("Iscritto archiviato con successo.", "success");
      if (onDataUpdate) onDataUpdate();
      navigate('/iscritti');
    } catch (e) {
      showNotification("Errore durante l'archiviazione.", "error");
    }
  };

  // FUNZIONE PER AGGIUNTA PAGAMENTO
  const handleAggiungiPagamento = async (paymentData) => {
    if (!iscritto) return;
    const { cifra, tipo, mese } = paymentData;
    const oggi = new Date();
    let dataPagamentoSpecifica = oggi;
    const nuovoPagamento = {
      iscrittoId: iscritto.id,
      iscrittoNome: `${iscritto.nome} ${iscritto.cognome}`,
      cifra: cifra,
      tipo: tipo,
      sede: iscritto.sede || 'N/D',
    };
    const iscrittoRef = doc(db, "iscritti", iscritto.id);
    let datiDaAggiornare = {};
    let alertMessage = `Pagamento di tipo "${tipo}" per ${cifra}€ registrato.`;

    if (tipo === 'Quota Mensile') {
      // FIX SINTASSI: Risoluzione dell'errore di sintassi nel calcolo dell'anno.
      // Assumiamo l'anno corrente a meno che il mese non sia nel passato della stagione (dopo Settembre)
      const targetYear = (mese < oggi.getMonth() && oggi.getMonth() >= 8) ? oggi.getFullYear() + 1 : oggi.getFullYear();

      dataPagamentoSpecifica = new Date(targetYear, mese, 15);
      
      if (cifra >= (iscritto.quotaMensile || 60)) {
        const vecchiaScadenza = iscritto.abbonamento?.scadenza ? new Date(iscritto.abbonamento.scadenza) : oggi;
        const basePerCalcolo = vecchiaScadenza > oggi ? vecchiaScadenza : oggi;
        basePerCalcolo.setMonth(basePerCalcolo.getMonth() + 1);
        const nuovaScadenza = basePerCalcolo.toISOString().split('T')[0];
        datiDaAggiornare.abbonamento = { ...iscritto.abbonamento, scadenza: nuovaScadenza };
        alertMessage += ` Nuova scadenza: ${nuovaScadenza}`;
      }
    } else if (tipo === 'Iscrizione / Annuale') {
      const vecchiaScadenza = iscritto.abbonamento?.scadenza ? new Date(iscritto.abbonamento.scadenza) : oggi;
      const basePerCalcolo = vecchiaScadenza > oggi ? vecchiaScadenza : oggi;
      basePerCalcolo.setFullYear(basePerCalcolo.getFullYear() + 1);
      const nuovaScadenza = basePerCalcolo.toISOString().split('T')[0];
      datiDaAggiornare.abbonamento = { ...iscritto.abbonamento, scadenza: nuovaScadenza };
      datiDaAggiornare.quotaIscrizione = (iscritto.quotaIscrizione || 0) + cifra;
      alertMessage = `Pagamento annuale registrato. Nuova scadenza: ${nuovaScadenza}`;
    }
    
    // Assicuriamo che la data di pagamento sia sempre una stringa valida per Firestore.
    nuovoPagamento.dataPagamento = dataPagamentoSpecifica.toISOString().split('T')[0];

    try {
        await addDoc(collection(db, "pagamenti"), nuovoPagamento);
        if (Object.keys(datiDaAggiornare).length > 0) {
            await updateDoc(iscrittoRef, datiDaAggiornare);
        }
        showNotification(alertMessage, 'success');
        setPagamentoDialogOpen(false);
        fetchIscritto();
        if (onDataUpdate) onDataUpdate();
    } catch(e) { 
      console.error("Errore: ", e);
      showNotification("Errore durante la registrazione del pagamento.", 'error'); 
    }
  };

  // NUOVA FUNZIONE PER L'ELIMINAZIONE DEFINITIVA
  const handleEliminaIscritto = async () => {
    if (!window.confirm("ATTENZIONE: Stai per eliminare definitivamente questo iscritto e tutti i suoi dati. L'azione è irreversibile. Continuare?")) return;
    try {
      await deleteDoc(doc(db, "iscritti", iscrittoId));
      showNotification("Iscritto eliminato definitivamente.", "warning");
      if (onDataUpdate) onDataUpdate();
      navigate('/iscritti');
    } catch (e) {
      showNotification("Errore durante l'eliminazione.", "error");
    }
  };


  const handleStampaRicevuta = () => {
    generateReceipt(iscritto, pagamenti, logoImage, firmaImage);
  };
  
  const handleTabChange = (event, newValue) => { setTabValue(newValue); };
  const formatDate = (dateString) => { if (!dateString) return 'N/D'; return new Date(dateString).toLocaleDateString('it-IT'); };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!iscritto) return <Typography>Iscritto non trovato.</Typography>;

  // Stili aggiuntivi per il pulsante "Torna alla lista" per coerenza con il nuovo tema
  const backButtonColor = theme.palette.mode === 'light' ? theme.palette.text.primary : theme.palette.text.secondary;


  return (
    <>
      <Button 
        component={RouterLink} 
        to="/iscritti" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 2, color: backButtonColor }} // Colore testo per coerenza con il tema light
      >
        Torna alla Lista Iscritti
      </Button>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            {/* MODIFICA: Applica il colore Primary (Viola/Blu) al nome del socio */}
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              {iscritto.nome} {iscritto.cognome}
            </Typography>
            <Typography color="text.secondary">{iscritto.codiceFiscale}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {/* PULSANTE STAMPA: Contained, Colore Info (Azzurro) */}
            <Button 
              variant="contained" 
              color="info" 
              startIcon={<PrintIcon />} 
              onClick={handleStampaRicevuta}
            >
              Stampa Ricevuta
            </Button>
            
            {/* PULSANTE MODIFICA: Contained, Colore Primary (Viola scuro), FORZA TESTO BIANCO */}
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<EditIcon />} 
              onClick={() => setEditDialogOpen(true)}
              sx={{ color: 'white' }} 
            >
              Modifica Dati
            </Button>

            {/* PULSANTE ARCHIVIA: Contained, Colore Warning (Giallo/Arancio) */}
            <Button 
              variant="contained" 
              color="warning" 
              startIcon={<ArchiveIcon />} 
              onClick={handleArchiviaIscritto}
            >
              Archivia
            </Button>
            
            {/* PULSANTE ELIMINA: Contained, Colore Error (Rosso tenue) */}
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {/* MODIFICA: Nomi dei Tab in grassetto */}
            <Tab label="Generale" sx={{ fontWeight: 'bold' }} />
            <Tab label="Contatti" sx={{ fontWeight: 'bold' }} />
            <Tab label="Dati Sanitari" sx={{ fontWeight: 'bold' }} />
            <Tab label="Pagamenti" sx={{ fontWeight: 'bold' }} />
            <Tab label="Documenti" sx={{ fontWeight: 'bold' }} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Dati Anagrafici</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Nato/a il:</strong> {formatDate(iscritto.dataNascita)} a {iscritto.luogoNascita || 'N/D'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>Sede:</strong> {iscritto.sede || 'N/D'}</Typography></Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Dati Familiari</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Genitore:</strong> {iscritto.nomeGenitore || 'N/D'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>CF Genitore:</strong> {iscritto.cfGenitore || 'N/D'}</Typography></Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Indirizzo e Contatti</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {iscritto.email || 'N/D'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>Cellulare:</strong> {iscritto.cellulare || 'N/D'}</Typography></Grid>
            <Grid item xs={12}><Typography><strong>Residenza:</strong> {`${iscritto.via || ''} ${iscritto.numeroCivico || ''}, ${iscritto.cap || ''} ${iscritto.residenza || ''}`}</Typography></Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Dati Sanitari</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Codice Assicurazione:</strong> {iscritto.codiceAssicurazione || 'N/D'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Chip color={iscritto.certificatoMedico?.presente ? "success" : "error"} label={iscritto.certificatoMedico?.presente ? "Certificato Presente" : "Certificato Mancante"} /></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>Scadenza Certificato:</strong> {formatDate(iscritto.certificatoMedico?.scadenza)}</Typography></Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Button onClick={() => setPagamentoDialogOpen(true)} variant="contained" color="success" sx={{ mb: 2 }}>Aggiungi Pagamento</Button>
          <StoricoPagamenti pagamenti={pagamenti} quotaMensile={iscritto.quotaMensile} quotaIscrizione={iscritto.quotaIscrizione} />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Gestione Documentale</Typography>
          <FileUpload onUpload={handleFileUpload} isLoading={uploading} />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Documenti Caricati</Typography>
          <DocumentList documents={documenti} onDelete={handleFileDelete} />
        </TabPanel>
      </Paper>

      <IscrittoEditDialog iscritto={iscritto} open={isEditDialogOpen} onClose={() => setEditDialogOpen(false)} onSave={handleUpdateIscritto} />
      <AggiungiPagamentoDialog open={isPagamentoDialogOpen} onClose={() => setPagamentoDialogOpen(false)} onSave={handleAggiungiPagamento} iscritto={iscritto} />
    </>
  );
}

export default SchedaSocioPage;