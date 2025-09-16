import React, { useMemo } from 'react';
import { Typography, Grid, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import StatCard from '../components/StatCard.jsx';

function DashboardPage({ iscritti, loading }) {
  
  const stats = useMemo(() => {
    // Controllo di sicurezza: se 'iscritti' non è ancora un array, ritorna valori di default
    if (!iscritti) {
      return { totaleIscritti: 0, certificatiInScadenza: [], abbonamentiScaduti: [], pagamentiInSospeso: [] };
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const certificatiInScadenza = iscritti.filter(iscritto => {
      if (!iscritto.certificatoMedico?.scadenza) return false;
      const dataLimite = new Date();
      dataLimite.setDate(oggi.getDate() + 30);
      const scadenza = new Date(iscritto.certificatoMedico.scadenza);
      return scadenza >= oggi && scadenza <= dataLimite;
    });
    
    const abbonamentiScaduti = iscritti.filter(iscritto => {
      if (!iscritto.abbonamento?.scadenza) return false;
      const scadenza = new Date(iscritto.abbonamento.scadenza);
      return scadenza < oggi;
    });

    const pagamentiInSospeso = iscritti.filter(iscritto => iscritto.statoPagamento === 'In Sospeso');

    return {
      totaleIscritti: iscritti.length,
      certificatiInScadenza,
      abbonamentiScaduti,
      pagamentiInSospeso,
    };
  }, [iscritti]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      {iscritti.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nessun iscritto trovato. Aggiungi il primo socio dalla pagina "Iscritti" per vedere le statistiche.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, borderRadius: 4, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Lista Abbonamenti Scaduti</Typography>
              <Divider sx={{ mb: 1 }}/>
              {stats.abbonamentiScaduti.length > 0 ? (
                <List dense>
                  {stats.abbonamentiScaduti.map(iscritto => (
                    <ListItem key={iscritto.id}>
                      <ListItemText 
                        primary={`${iscritto.nome} ${iscritto.cognome}`}
                        secondary={`Scaduto il: ${new Date(iscritto.abbonamento.scadenza).toLocaleDateString('it-IT')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>Nessun abbonamento scaduto.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={12}><StatCard title="Totale Iscritti" value={stats.totaleIscritti} icon={<PeopleIcon />} color="primary.main" /></Grid>
              <Grid item xs={12} sm={6} md={12}><StatCard title="Certificati in Scadenza (30gg)" value={stats.certificatiInScadenza.length} icon={<WarningIcon />} color="warning.main" /></Grid>
              <Grid item xs={12} sm={6} md={12}><StatCard title="Abbonamenti Scaduti" value={stats.abbonamentiScaduti.length} icon={<EventBusyIcon />} color="error.main" /></Grid>
              <Grid item xs={12} sm={6} md={12}><StatCard title="Pagamenti in Sospeso" value={stats.pagamentiInSospeso.length} icon={<PaymentIcon />} color="info.main" /></Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default DashboardPage;