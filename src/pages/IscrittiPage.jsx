import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, addDoc, doc, deleteDoc, updateDoc, getDocs, query } from "firebase/firestore"; 
import { db } from '../firebase.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { exportToExcel } from '../utils/exportToExcel.js';
import IscrittoForm from '../components/IscrittoForm.jsx';
import IscrittiLista from '../components/IscrittiLista.jsx';
import { Button, Typography, Paper, Box, TextField } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function IscrittiPage({ iscrittiList, onDataUpdate, onIscrittoAdded }) {
  const { showNotification } = useNotification();
  const [iscritti, setIscritti] = useState(iscrittiList);
  const [gruppi, setGruppi] = useState([]);
  const [selection, setSelection] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

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
    const filtroAttivo = searchParams.get('filtro');
    const gruppoIdFiltrato = searchParams.get('gruppoId');

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
  }, [searchTerm, iscritti, searchParams, gruppi]);

  const handleAddIscritto = async (nuovoIscritto) => {
    try {
      const docRef = await addDoc(collection(db, "iscritti"), { ...nuovoIscritto, stato: 'attivo' });
      onIscrittoAdded({ id: docRef.id, ...nuovoIscritto, stato: 'attivo' });
      showNotification(`Iscritto "${nuovoIscritto.nome}" salvato!`, 'success');
    } catch (e) {
      showNotification("Errore durante il salvataggio.", 'error');
    }
  };
  
  const handleSelectionChange = (id) => {
    const newSelection = selection.includes(id) ? selection.filter(i => i !== id) : [...selection, id];
    setSelection(newSelection);
  };

  const handleExport = () => {
    const dataToExport = iscrittiList.filter(iscritto => selection.includes(iscritto.id));
    if (dataToExport.length === 0) return;
    exportToExcel(dataToExport, `lista_atleti_gara`);
  };

  return (
    <>
      <IscrittoForm onIscrittoAggiunto={handleAddIscritto} />
      
      <Paper sx={{ p: 2, mt: 4, mb: 2, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box flexGrow={1}><TextField fullWidth variant="filled" label="Cerca per nome, cognome, codice fiscale..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></Box>
        {selection.length > 0 && (<Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleExport}>Esporta {selection.length} Atleti</Button>)}
      </Paper>

      <IscrittiLista iscritti={filteredIscritti} onSelect={handleSelectionChange} selection={selection} />
    </>
  );
}

export default IscrittiPage;