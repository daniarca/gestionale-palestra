import React, { useMemo, useState, useEffect } from 'react';
import { Typography, Grid, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, Alert, Button, Stack, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import StatCard from '../components/StatCard.jsx';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase.js';

const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

function DashboardPage({ iscritti, loading }) {
  const [pagamenti, setPagamenti] = useState([]);
  const [gruppi, setGruppi] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pagamentiSnapshot = await getDocs(query(collection(db, "pagamenti"), orderBy("dataPagamento", "desc"), limit(5)));
        setPagamenti(pagamentiSnapshot.docs.map(doc => doc.data()));
        
        const gruppiSnapshot = await getDocs(query(collection(db, "gruppi")));
        setGruppi(gruppiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
      } catch (error) {
        console.error("Errore nel recupero dei dati della dashboard:", error);
      }
      setLoadingDashboard(false);
    };

    if (!loading) fetchData();
  }, [loading]);

  const stats = useMemo(() => {
    const oggi = new Date();
    const giornoOggi = oggi.getDay();
    
    const pagamentiInSospeso = iscritti.filter(i => i.statoPagamento === 'In Sospeso');
    const certificatiInScadenza = iscritti.filter(iscritto => {
      if (!iscritto.certificatoMedico?.scadenza) return false;
      const dataLimite = new Date(); dataLimite.setDate(oggi.getDate() + 30);
      const scadenza = new Date(iscritto.certificatoMedico.scadenza);
      return scadenza >= oggi && scadenza <= dataLimite;
    });

    const certificatiMancanti = iscritti.filter(i => i.certificatoMedico?.presente === false);
    const totaleIncassato = pagamenti.reduce((acc, p) => acc + p.cifra, 0);

    const orariDiOggi = gruppi
      .filter(g => g.giornoSettimana === giornoOggi)
      .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));
    
    const ultimiIscritti = iscritti
      .sort((a, b) => new Date(b.dataIscrizione) - new Date(a.dataIscrizione))
      .slice(0, 5);

    return {
      totaleIscritti: iscritti.length,
      certificatiInScadenza: certificatiInScadenza,
      certificatiMancanti: certificatiMancanti,
      pagamentiInSospeso: pagamentiInSospeso,
      totaleIncassato,
      ultimiIscritti,
      orariDiOggi,
      pagamentiRecenti: pagamenti,
    };
  }, [iscritti, pagamenti, gruppi]);

  if (loading || loadingDashboard) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
      
      {/* SEZIONE 1: Azioni Rapide e Statistiche Principali */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Azioni Rapide</Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button variant="contained" component={RouterLink} to="/iscritti/nuovo" startIcon={<AddIcon />}>Nuovo Socio</Button>
              <Button variant="outlined" component={RouterLink} to="/gruppi/nuovo" startIcon={<GroupAddIcon />}>Nuovo Gruppo</Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <StatCard title="Totale Iscritti" value={stats.totaleIscritti} icon={<PeopleIcon />} color="primary.main" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard title="Certificati da Controllare" value={stats.certificatiInScadenza.length + stats.certificatiMancanti.length} icon={<WarningIcon />} color="warning.main" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard title="Pagamenti in Sospeso" value={stats.pagamentiInSospeso.length} icon={<PaymentIcon />} color="error.main" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* SEZIONE 2: Cassa e Ultimi Pagamenti */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>Cassa</Typography>
            <Stack direction="column" spacing={1}>
              <Box><Typography>Totale incassato: <strong>€{stats.totaleIncassato.toFixed(2)}</strong></Typography></Box>
              <Divider />
              <Typography variant="h6" gutterBottom>Ultimi Pagamenti</Typography>
              {stats.pagamentiRecenti.length > 0 ? (
                <List dense disablePadding>
                  {stats.pagamentiRecenti.map((p, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText
                        primary={`${p.iscrittoNome}: €${p.cifra.toFixed(2)}`}
                        secondary={p.dataPagamento}
                      />
                      <Chip label={p.tipo} size="small" />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Nessun pagamento recente.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      {/* SEZIONE 3: Liste dinamiche (Visite Mediche, Ultimi Iscritti) */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>Visite Mediche in Scadenza</Typography>
            <Divider sx={{ my: 1 }}/>
            {stats.certificatiInScadenza.length > 0 ? (
              <List dense>
                {stats.certificatiInScadenza.map(iscritto => (
                  <ListItem key={iscritto.id} component={RouterLink} to={`/iscritti/${iscritto.id}`}>
                    <ListItemText primary={`${iscritto.nome} ${iscritto.cognome}`} secondary={`Scadenza: ${new Date(iscritto.certificatoMedico.scadenza).toLocaleDateString()}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">Nessun certificato in scadenza nei prossimi 30 giorni.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>Orari di Oggi ({giorni[new Date().getDay()]})</Typography>
            <Divider sx={{ mb: 1 }}/>
            {stats.orariDiOggi.length > 0 ? (
              <List dense>
                {stats.orariDiOggi.map(gruppo => (
                  <ListItem key={gruppo.id}>
                    <ListItemText 
                      primary={`${gruppo.oraInizio} - ${gruppo.oraFine}: ${gruppo.nome}`}
                      secondary={gruppo.staffNome}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">Nessun gruppo in programma per oggi.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;