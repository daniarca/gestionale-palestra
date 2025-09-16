import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { db } from '../firebase.js';
import { exportToExcel } from '../utils/exportToExcel.js';
import IscrittoForm from '../components/IscrittoForm.jsx';
import IscrittiLista from '../components/IscrittiLista.jsx';
import IscrittoDetailDialog from '../components/IscrittoDetailDialog.jsx';
import IscrittoEditDialog from '../components/IscrittoEditDialog.jsx';
import AggiungiPagamentoDialog from '../components/AggiungiPagamentoDialog.jsx';
import { Button, Typography, Paper, Box, TextField } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function IscrittiPage({ iscrittiList, onDataUpdate }) {
  const [iscritti, setIscritti] = useState(iscrittiList);
  const [selection, setSelection] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [currentIscritto, setCurrentIscritto] = useState(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isPagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);

  useEffect(() => {
    setIscritti(iscrittiList);
  }, [iscrittiList]);

  const filteredIscritti = useMemo(() => {
    if (!searchTerm) return iscritti;
    return iscritti.filter(iscritto => 
      (iscritto.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (iscritto.cognome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (iscritto.codiceFiscale?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, iscritti]);

  const handleAddIscritto = async (nuovoIscritto) => {
    await addDoc(collection(db, "iscritti"), nuovoIscritto);
    onDataUpdate();
  };
  
  const handleDeleteIscritto = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo iscritto?")) return;
    await deleteDoc(doc(db, "iscritti", id));
    setDetailOpen(false);
    onDataUpdate();
  };

  const handleUpdateIscritto = async (updatedData) => {
    const iscrittoRef = doc(db, "iscritti", updatedData.id);
    await updateDoc(iscrittoRef, updatedData);
    setEditDialogOpen(false);
    onDataUpdate();
  };
  
  const handleViewDetails = (iscritto) => {
    setCurrentIscritto(iscritto);
    setDetailOpen(true);
  };

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
    setDetailOpen(false);
  };

  const handlePrint = (iscritto) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Scheda Socio - ${iscritto.nome} ${iscritto.cognome}</title><style>body{font-family:Arial,sans-serif;margin:40px}h1,h2{text-align:center}div{margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #eee}strong{font-weight:bold}</style></head><body><h2>A.S.D. GYM POINT</h2><h1>SCHEDA SOCIO</h1><div><strong>Cognome:</strong> ${iscritto.cognome || ''}</div><div><strong>Nome:</strong> ${iscritto.nome || ''}</div><div><strong>Nato/a a:</strong> ${iscritto.luogoNascita || ''} il ${iscritto.dataNascita || ''}</div><div><strong>Residenza:</strong> ${iscritto.residenza || ''} (CAP: ${iscritto.cap || ''})</div><div><strong>Indirizzo:</strong> ${iscritto.via || ''}, N. ${iscritto.numeroCivico || ''}</div><div><strong>Cellulare:</strong> ${iscritto.cellulare || ''}</div><div><strong>Email:</strong> ${iscritto.email || ''}</div><div><strong>Codice Fiscale:</strong> ${iscritto.codiceFiscale || ''}</div><br/><div><strong>Genitore:</strong> ${iscritto.nomeGenitore || ''} (CF: ${iscritto.cfGenitore || ''})</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleSelectionChange = (id) => {
    const newSelection = selection.includes(id) ? selection.filter(i => i !== id) : [...selection, id];
    setSelection(newSelection);
  };

  const handleExport = () => {
    const dataToExport = iscritti.filter(iscritto => selection.includes(iscritto.id));
    if (dataToExport.length === 0) return;
    exportToExcel(dataToExport, `lista_atleti_gara`);
  };
  
  const handleOpenPagamentoDialog = () => {
    setPagamentoDialogOpen(true);
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
    if (tipo === 'Quota Mensile') {
      const anno = mese < oggi.getMonth() ? oggi.getFullYear() + 1 : oggi.getFullYear();
      dataPagamentoSpecifica = new Date(anno, mese, 15);
      if (cifra >= (currentIscritto.quotaMensile || 60)) {
        const vecchiaScadenza = currentIscritto.abbonamento?.scadenza ? new Date(currentIscritto.abbonamento.scadenza) : oggi;
        const basePerCalcolo = vecchiaScadenza > oggi ? vecchiaScadenza : oggi;
        basePerCalcolo.setMonth(basePerCalcolo.getMonth() + 1);
        const nuovaScadenza = basePerCalcolo.toISOString().split('T')[0];
        datiDaAggiornare.abbonamento = { scadenza: nuovaScadenza };
      }
    } else if (tipo === 'Quota Iscrizione') {
      datiDaAggiornare.quotaIscrizione = cifra;
    }
    nuovoPagamento.dataPagamento = dataPagamentoSpecifica.toISOString().split('T')[0];
    try {
        await addDoc(collection(db, "pagamenti"), nuovoPagamento);
        if (Object.keys(datiDaAggiornare).length > 0) {
            await updateDoc(iscrittoRef, datiDaAggiornare);
        }
        alert(`Pagamento di tipo "${tipo}" per ${cifra}€ registrato.`);
        setPagamentoDialogOpen(false);
        setDetailOpen(false);
        onDataUpdate();
    } catch(e) { console.error("Errore: ", e); alert("Errore durante la registrazione del pagamento."); }
  };

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