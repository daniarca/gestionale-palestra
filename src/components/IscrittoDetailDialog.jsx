import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Box, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import StoricoPagamenti from './StoricoPagamenti.jsx';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase.js';

function IscrittoDetailDialog({ iscritto, open, onClose, onEdit, onDelete, onAggiungiPagamento }) {
  const [pagamenti, setPagamenti] = useState([]);
  const [loadingPagamenti, setLoadingPagamenti] = useState(true);

  useEffect(() => {
    if (open && iscritto) {
      const fetchPagamenti = async () => {
        setLoadingPagamenti(true);
        const q = query(collection(db, "pagamenti"), where("iscrittoId", "==", iscritto.id));
        const querySnapshot = await getDocs(q);
        const pagamentiList = querySnapshot.docs.map(doc => doc.data());
        setPagamenti(pagamentiList);
        setLoadingPagamenti(false);
      };
      fetchPagamenti();
    }
  }, [open, iscritto]);

  if (!iscritto) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Scheda di {iscritto.nome} {iscritto.cognome}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Typography><strong>Sede:</strong> {iscritto.sede || 'N/D'}</Typography>
            <Typography><strong>Email:</strong> {iscritto.email || 'N/D'}</Typography>
            <Typography><strong>Cellulare:</strong> {iscritto.cellulare || 'N/D'}{iscritto.cellulare1Tipo ? ` (${iscritto.cellulare1Tipo})` : ''}</Typography>
            {iscritto.cellulare2 && (
              <Typography><strong>Cellulare 2:</strong> {iscritto.cellulare2}{iscritto.cellulare2Tipo ? ` (${iscritto.cellulare2Tipo})` : ''}</Typography>
            )}
            <Typography><strong>Nato/a il:</strong> {formatDate(iscritto.dataNascita)} a {iscritto.luogoNascita || 'N/D'}</Typography>
            <Typography><strong>Residenza:</strong> {`${iscritto.via || ''} ${iscritto.numeroCivico || ''}, ${iscritto.cap || ''} ${iscritto.residenza || ''}`}</Typography>
            <Typography><strong>Codice Fiscale:</strong> {iscritto.codiceFiscale || 'N/D'}</Typography>
            <Typography><strong>Codice Assicurazione:</strong> {iscritto.codiceAssicurazione || 'N/D'}</Typography>
            <Typography><strong>Genitore:</strong> {iscritto.nomeGenitore || 'N/D'} (CF: {iscritto.cfGenitore || 'N/D'})</Typography>
            <Typography><strong>Quota Iscrizione:</strong> {iscritto.quotaIscrizione ? `${iscritto.quotaIscrizione}€` : 'N/D'}</Typography>
            <Typography><strong>Quota Mensile:</strong> {iscritto.quotaMensile ? `${iscritto.quotaMensile}€` : 'N/D'}</Typography>
            <Typography><strong>Scadenza Abbonamento:</strong> {formatDate(iscritto.abbonamento?.scadenza)}</Typography>
            <Typography><strong>Scadenza Certificato:</strong> {formatDate(iscritto.certificatoMedico?.scadenza)}</Typography>
            <Typography><strong>Calisthenics:</strong> {iscritto.isCalisthenics ? 'Sì' : 'No'}</Typography>
            <Typography><strong>Annotazioni:</strong> {iscritto.annotazioni || 'Nessuna'}</Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            {loadingPagamenti ? <CircularProgress /> : 
              <StoricoPagamenti 
                pagamenti={pagamenti} 
                quotaMensile={iscritto.quotaMensile}
                quotaIscrizione={iscritto.quotaIscrizione}
              />
            }
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={onAggiungiPagamento} startIcon={<PaymentIcon />} color="success" variant="contained">Aggiungi Pagamento</Button>
        <Box>
          <Button onClick={onEdit} startIcon={<EditIcon />}>Modifica Dati</Button>
          <Button color="error" onClick={() => onDelete(iscritto.id)} startIcon={<DeleteIcon />}>Elimina</Button>
          <Button onClick={onClose}>Chiudi</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default IscrittoDetailDialog;