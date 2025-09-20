// File: src/pages/ArchivioPage.jsx (Nuovo File)

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore"; 
import { db } from '../firebase.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { Typography, Box, Paper, List, ListItem, ListItemText, Button, Divider, CircularProgress } from '@mui/material';

function ArchivioPage() {
  const [archiviati, setArchiviati] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchArchiviati = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "iscritti"), where("stato", "==", "archiviato"));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArchiviati(list);
    } catch (error) {
      console.error("Errore caricamento archivio: ", error);
      showNotification("Errore nel caricamento dell'archivio", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiviati();
  }, []);

  const handleRipristina = async (id) => {
    if (!window.confirm("Sei sicuro di voler ripristinare questo iscritto?")) return;
    try {
      const iscrittoRef = doc(db, "iscritti", id);
      await updateDoc(iscrittoRef, { stato: "attivo" });
      showNotification("Iscritto ripristinato con successo!", "success");
      fetchArchiviati(); // Ricarica la lista degli archiviati per aggiornare la UI
    } catch (error) {
      console.error("Errore ripristino:", error);
      showNotification("Errore durante il ripristino.", "error");
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Archivio Iscritti</Typography>
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <List>
          {archiviati.length > 0 ? archiviati.map((iscritto, index) => (
            <React.Fragment key={iscritto.id}>
              <ListItem secondaryAction={
                <Button variant="outlined" size="small" onClick={() => handleRipristina(iscritto.id)}>Ripristina</Button>
              }>
                <ListItemText 
                  primary={`${iscritto.nome} ${iscritto.cognome}`}
                  secondary={`Sede: ${iscritto.sede || 'N/D'}`}
                />
              </ListItem>
              {index < archiviati.length - 1 && <Divider />}
            </React.Fragment>
          )) : (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>L'archivio è vuoto.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default ArchivioPage;