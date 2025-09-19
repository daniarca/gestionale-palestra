// File: src/pages/DashboardPage.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { Typography, Grid, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, Alert, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import StatCard from '../components/StatCard.jsx';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase.js';

const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

function DashboardPage({ iscritti, loading }) {
  const [pagamenti, setPagamenti] = useState([]);
  const [gruppi, setGruppi] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const pagamentiSnapshot = await getDocs(query(collection(db, "pagamenti")));
      setPagamenti(pagamentiSnapshot.docs.map(doc => doc.data()));
      
      const gruppiSnapshot = await getDocs(query(collection(db, "gruppi")));
      setGruppi(gruppiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    if (!loading) fetchData();
  }, [loading]);

  const stats = useMemo(() => {
    const oggi = new Date();
    const giornoOggi = oggi.getDay();
    
    const pagamentiDaSaldare = iscritti.filter(iscritto => iscritto.statoPagamento === 'In Sospeso'); // Semplificato per ora
    const certificatiInScadenza = iscritti.filter(iscritto => {
      if (!iscritto.certificatoMedico?.scadenza) return false;
      const dataLimite = new Date(); dataLimite.setDate(oggi.getDate() + 30);
      const scadenza = new Date(iscritto.certificatoMedico.scadenza);
      return scadenza >= oggi && scadenza <= dataLimite;
    });
    const orariDiOggi = gruppi.filter(g => g.giornoSettimana === giornoOggi).sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));

    return {
      totaleIscritti: iscritti.length,
      certificatiInScadenza: certificatiInScadenza.length,
      pagamentiDaSaldare: pagamentiDaSaldare.length,
      orariDiOggi,
    };
  }, [iscritti, pagamenti, gruppi]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
      
      <Paper sx={{ p: 2, borderRadius: 4, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Azioni Rapide</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" component={RouterLink} to="/iscritti" startIcon={<AddIcon />}>Nuovo Socio</Button>
          <Button variant="outlined" component={RouterLink} to="/gruppi" startIcon={<GroupAddIcon />}>Nuovo Gruppo</Button>
        </Stack>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}><StatCard title="Totale Iscritti" value={stats.totaleIscritti} icon={<PeopleIcon />} color="primary.main" /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Certificati in Scadenza" value={stats.certificatiInScadenza} icon={<WarningIcon />} color="warning.main" /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Pagamenti da Saldare" value={stats.pagamentiDaSaldare} icon={<PaymentIcon />} color="error.main" /></Grid>
      </Grid>
      
      <Paper sx={{ p: 2, borderRadius: 4, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Orari di Oggi ({giorni[new Date().getDay()]})</Typography>
        <Divider sx={{ mb: 1 }}/>
        {stats.orariDiOggi.length > 0 ? (
          <List dense>
            {stats.orariDiOggi.map(gruppo => (
              <ListItem key={gruppo.id}>
                <ListItemText 
                  primary={`${gruppo.oraInizio} - ${gruppo.oraFine}: ${gruppo.nome}`}
                  secondary={`${gruppo.staffNome} - Sede: ${gruppo.sede}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>Nessun gruppo in programma per oggi.</Typography>
        )}
      </Paper>
    </Box>
  );
}

export default DashboardPage;