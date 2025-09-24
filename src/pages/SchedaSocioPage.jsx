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
import moment from 'moment'; // Importato moment

// Imposta la lingua italiana per moment
moment.locale('it');

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

  // LOGICA AGGIUNTA PAGAMENTO CON SCADENZA FINE MESE (REVISIONE COMPLETA)
  const handleAggiungiPagamento = async (paymentData) => {
    if (!iscritto) return;
    const { cifra, tipo, mese } = paymentData;
    const oggi = moment().startOf('day'); 
    
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
        const finalQuotaMensile = iscritto.quotaMensile || 60;
        const finalMonthsPaid = Math.floor(cifra / finalQuotaMensile);

        if (finalMonthsPaid > 0) {
            
            const lastExpiration = iscritto.abbonamento?.scadenza ? moment(iscritto.abbonamento.scadenza) : null;
            let baseAdvanceDate = moment(oggi).startOf('day'); 

            if (lastExpiration && lastExpiration.isAfter(baseAdvanceDate, 'day')) {
                // Se c'è una scadenza futura, partiamo da quella data
                baseAdvanceDate = lastExpiration.clone();
            } else {
                // Se la scadenza è passata o non esiste, impostiamo la base all'ULTIMO GIORNO del mese corrente
                baseAdvanceDate = moment().endOf('month');
            }
            
            // Avanza per il numero di mesi pagati e fissa la data all'ultimo giorno del mese risultante.
            let nuovaScadenzaDate = baseAdvanceDate.add(finalMonthsPaid, 'month').endOf('month');
            const nuovaScadenza = nuovaScadenzaDate.format('YYYY-MM-DD'); 
            
            datiDaAggiornare.abbonamento = { 
                ...iscritto.abbonamento, 
                scadenza: nuovaScadenza,
                // Il mese pagato è l'indice del mese di scadenza (ultimo mese coperto).
                mesePagato: nuovaScadenzaDate.month(), 
            };
            
            alertMessage = `Pagamento di ${finalMonthsPaid} mese/i registrato. Nuova scadenza: ${moment(nuovaScadenza).format('DD/MM/YYYY')}`;
            
        } else {
             // Pagamento di acconto. Nessuna modifica alla scadenza.
             alertMessage = `Pagamento di acconto registrato per ${cifra}€. Nessuna modifica alla scadenza.`;
        }
    } else if (tipo === 'Iscrizione / Annuale') {
        // La logica Annuale avanza di un anno e fissa a fine mese.
        const vecchiaScadenza = iscritto.abbonamento?.scadenza ? moment(iscritto.abbonamento.scadenza) : moment(oggi);
        const nuovaScadenzaDate = vecchiaScadenza.clone().add(1, 'year').endOf('month'); 
        const nuovaScadenza = nuovaScadenzaDate.format('YYYY-MM-DD');

        datiDaAggiornare.abbonamento = { 
            ...iscritto.abbonamento, 
            scadenza: nuovaScadenza,
            mesePagato: nuovaScadenzaDate.month(), 
        };
        datiDaAggiornare.quotaIscrizione = (iscritto.quotaIscrizione || 0) + cifra;
        alertMessage = `Pagamento annuale registrato. Nuova scadenza: ${moment(nuovaScadenza).format('DD/MM/YYYY')}`;
    }
    
    nuovoPagamento.dataPagamento = moment(oggi).format('YYYY-MM-DD'); 

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
  
  // Utilizzo di moment per garantire il formato DD/MM/YYYY
  const formatDate = (dateString) => { 
    if (!dateString) return 'N/D'; 
    return moment(dateString).format('DD/MM/YYYY');
  };

  // Funzione per ottenere il nome del mese in italiano
  const getMonthName = (monthIndex) => {
    if (monthIndex == null || monthIndex === '') return 'N/D';
    return moment().month(monthIndex).format('MMMM').charAt(0).toUpperCase() + moment().month(monthIndex).format('MMMM').slice(1);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!iscritto) return <Typography>Iscritto non trovato.</Typography>;

  const backButtonColor = theme.palette.mode === 'light' ? theme.palette.text.primary : theme.palette.text.secondary;

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
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              {iscritto.nome} {iscritto.cognome}
            </Typography>
            <Typography color="text.secondary">{iscritto.codiceFiscale}</Typography>
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
              sx={{ color: 'white' }} 
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
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
          
          {/* STATO ABBONAMENTO CON MESE DI RIFERIMENTO */}
          <Typography variant="h6" gutterBottom>Stato Abbonamento</Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
                <Typography>
                    <strong>Scadenza Abbonamento:</strong> {formatDate(iscritto.abbonamento?.scadenza)}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography>
                    <strong>Ultimo Mese Pagato:</strong> {getMonthName(iscritto.abbonamento?.mesePagato)}
                </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Dati Familiari</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Genitore:</strong> {iscritto.nomeGenitore || 'N/D'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>CF Genitore:</strong> {iscritto.cfGenitore || 'N/D'}</Typography></Grid>
          </Grid>
          
          {/* NOTE SEGRETERIA */}
          <Divider sx={{ my: 2 }} /> 
          <Typography variant="h6" gutterBottom>Note Segreteria</Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.default 
            }}
          >
             <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {iscritto.annotazioni || 'Nessuna nota.'}
             </Typography>
          </Paper>
          
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