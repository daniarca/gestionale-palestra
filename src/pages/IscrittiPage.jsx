import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, addDoc, doc, deleteDoc, updateDoc, getDocs, query } from "firebase/firestore"; 
import { db } from '../firebase.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { exportToExcel } from '../utils/exportToExcel.js';
import IscrittoForm from '../components/IscrittoForm.jsx';
import IscrittiLista from '../components/IscrittiLista.jsx';
import IscrittoDetailDialog from '../components/IscrittoDetailDialog.jsx';
import IscrittoEditDialog from '../components/IscrittoEditDialog.jsx';
import AggiungiPagamentoDialog from '../components/AggiungiPagamentoDialog.jsx';
import { Button, Typography, Paper, Box, TextField } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function IscrittiPage({ iscrittiList, onDataUpdate, onIscrittoAdded }) {
  const { showNotification } = useNotification();
  const [iscritti, setIscritti] = useState(iscrittiList);
  const [gruppi, setGruppi] = useState([]);
  const [selection, setSelection] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const filtroAttivo = searchParams.get('filtro');
  const gruppoIdFiltrato = searchParams.get('gruppoId');
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [currentIscritto, setCurrentIscritto] = useState(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isPagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);

  useEffect(() => {
    setIscritti(iscrittiList);
    const fetchGruppi = async () => {
      const q = query(collection(db, "gruppi"));
      const querySnapshot = await getDocs(q);
      setGruppi(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchGruppi();
  }, [iscrittiList]);

  const filteredIscritti = useMemo(() => {
    let items = [...iscritti];
    if (gruppoIdFiltrato) {
      const gruppo = gruppi.find(g => g.id === gruppoIdFiltrato);
      const membriIds = gruppo ? gruppo.membri : [];
      items = items.filter(iscritto => membriIds.includes(iscritto.id));
    }
    if (filtroAttivo) {
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      switch (filtroAttivo) {
        case 'abbonamenti_scaduti':
          items = items.filter(i => i.abbonamento?.scadenza && new Date(i.abbonamento.scadenza) < oggi);
          break;
        case 'certificati_scadenza':
          const dataLimite = new Date();
          dataLimite.setDate(oggi.getDate() + 30);
          items = items.filter(i => {
            if (!i.certificatoMedico?.scadenza) return false;
            const scadenza = new Date(i.certificatoMedico.scadenza);
            return scadenza >= oggi && scadenza <= dataLimite;
          });
          break;
        case 'certificati_mancanti':
          items = items.filter(i => !i.certificatoMedico?.presente || !i.certificatoMedico?.scadenza);
          break;
        case 'pagamenti_sospeso':
          items = items.filter(i => i.statoPagamento === 'In Sospeso');
          break;
        default: break;
      }
    }
    if (!searchTerm) return items;
    return items.filter(iscritto => 
      (iscritto.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (iscritto.cognome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (iscritto.codiceFiscale?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, iscritti, filtroAttivo, gruppoIdFiltrato, gruppi]);

  const handleAddIscritto = async (nuovoIscritto) => {
    try {
      const docRef = await addDoc(collection(db, "iscritti"), nuovoIscritto);
      onIscrittoAdded({ id: docRef.id, ...nuovoIscritto });
      showNotification(`Iscritto "${nuovoIscritto.nome}" salvato!`, 'success');
    } catch (e) {
      showNotification("Errore durante il salvataggio.", 'error');
    }
  };
  
  const handleDeleteIscritto = async (id) => {
    if (!window.confirm("Sei sicuro?")) return;
    try {
      await deleteDoc(doc(db, "iscritti", id));
      showNotification("Iscritto eliminato.", 'warning');
      setDetailOpen(false);
      onDataUpdate();
    } catch (e) {
      showNotification("Errore durante l'eliminazione.", 'error');
    }
  };

  const handleUpdateIscritto = async (updatedData) => {
    try {
      const iscrittoRef = doc(db, "iscritti", updatedData.id);
      await updateDoc(iscrittoRef, updatedData);
      showNotification("Dati aggiornati.", 'success');
      setEditDialogOpen(false);
      onDataUpdate();
    } catch (e) {
      showNotification("Errore durante l'aggiornamento.", 'error');
    }
  };
  
  const handleAggiungiPagamento = async (paymentData) => {
    if (!currentIscritto) return;
    const { cifra, tipo, mese } = paymentData;
    const oggi = new Date();
    let dataPagamentoSpecifica = oggi;
    const nuovoPagamento = {
      iscrittoId: currentIscritto.id,
      iscrittoNome: `${currentIscritto.nome} ${currentIscritto.cognome}`,
      cifra: cifra,
      tipo: tipo,
      sede: currentIscritto.sede || 'N/D',
    };
    const iscrittoRef = doc(db, "iscritti", currentIscritto.id);
    let datiDaAggiornare = {};
    let alertMessage = `Pagamento di tipo "${tipo}" per ${cifra}€ registrato.`;

    if (tipo === 'Quota Mensile') {
      const anno = mese < oggi.getMonth() ? oggi.getFullYear() + 1 : oggi.getFullYear();
      dataPagamentoSpecifica = new Date(anno, mese, 15);
      if (cifra >= (currentIscritto.quotaMensile || 60)) {
        const vecchiaScadenza = currentIscritto.abbonamento?.scadenza ? new Date(currentIscritto.abbonamento.scadenza) : oggi;
        const basePerCalcolo = vecchiaScadenza > oggi ? vecchiaScadenza : oggi;
        basePerCalcolo.setMonth(basePerCalcolo.getMonth() + 1);
        const nuovaScadenza = basePerCalcolo.toISOString().split('T')[0];
        datiDaAggiornare.abbonamento = { scadenza: nuovaScadenza };
        alertMessage += ` Nuova scadenza: ${nuovaScadenza}`;
      }
    } else if (tipo === 'Iscrizione / Annuale') {
        const vecchiaScadenza = currentIscritto.abbonamento?.scadenza ? new Date(currentIscritto.abbonamento.scadenza) : oggi;
        const basePerCalcolo = vecchiaScadenza > oggi ? vecchiaScadenza : oggi;
        basePerCalcolo.setFullYear(basePerCalcolo.getFullYear() + 1);
        const nuovaScadenza = basePerCalcolo.toISOString().split('T')[0];
        datiDaAggiornare.abbonamento = { scadenza: nuovaScadenza };
        datiDaAggiornare.quotaIscrizione = cifra;
        alertMessage = `Pagamento annuale registrato. Nuova scadenza: ${nuovaScadenza}`;
    }
    
    nuovoPagamento.dataPagamento = dataPagamentoSpecifica.toISOString().split('T')[0];

    try {
        await addDoc(collection(db, "pagamenti"), nuovoPagamento);
        if (Object.keys(datiDaAggiornare).length > 0) {
            await updateDoc(iscrittoRef, datiDaAggiornare);
        }
        showNotification(alertMessage, 'success');
        setPagamentoDialogOpen(false);
        setDetailOpen(false);
        onDataUpdate();
    } catch(e) { 
      console.error("Errore: ", e);
      showNotification("Errore durante la registrazione del pagamento.", 'error'); 
    }
  };

  const handleViewDetails = (iscritto) => { setCurrentIscritto(iscritto); setDetailOpen(true); };
  const handleOpenEditDialog = () => { setEditDialogOpen(true); setDetailOpen(false); };
  const handlePrint = (iscritto) => { /* Funzione Stampa */ };
  const handleSelectionChange = (id) => { const newSelection = selection.includes(id) ? selection.filter(i => i !== id) : [...selection, id]; setSelection(newSelection); };
  const handleExport = () => { const dataToExport = iscritti.filter(iscritto => selection.includes(iscritto.id)); if (dataToExport.length === 0) return; exportToExcel(dataToExport, `lista_atleti_gara`); };
  const handleOpenPagamentoDialog = () => { setPagamentoDialogOpen(true); };

  return (
    <>
      <IscrittoForm onIscrittoAggiunto={handleAddIscritto} />
      <Paper sx={{ p: 2, mt: 4, mb: 2, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: 2 }}>
        <Box flexGrow={1}><TextField fullWidth variant="filled" label="Cerca per nome, cognome, codice fiscale..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></Box>
        {selection.length > 0 && (<Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleExport}>Esporta {selection.length} Atleti</Button>)}
      </Paper>
      <IscrittiLista iscritti={filteredIscritti} onSelect={handleSelectionChange} selection={selection} onViewDetails={handleViewDetails} />
      <IscrittoDetailDialog iscritto={currentIscritto} open={isDetailOpen} onClose={() => setDetailOpen(false)} onEdit={handleOpenEditDialog} onDelete={handleDeleteIscritto} onPrint={handlePrint} onAggiungiPagamento={handleOpenPagamentoDialog} />
      <IscrittoEditDialog iscritto={currentIscritto} open={isEditDialogOpen} onClose={() => setEditDialogOpen(false)} onSave={handleUpdateIscritto} />
      <AggiungiPagamentoDialog open={isPagamentoDialogOpen} onClose={() => setPagamentoDialogOpen(false)} onSave={handleAggiungiPagamento} iscritto={currentIscritto} />
    </>
  );
}

export default IscrittiPage;