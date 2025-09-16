// File: src/pages/DashboardPage.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { Typography, Grid, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, Alert, Avatar, ListItemAvatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import PaymentIcon from '@mui/icons-material/Payment';
import StatCard from '../components/StatCard.jsx';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase.js';

// Funzione helper per accedere a proprietà annidate in modo sicuro
const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

function DashboardPage({ iscritti, loading }) {
  const [pagamenti, setPagamenti] = useState([]);

  useEffect(() => {
    const fetchPagamenti = async () => {
      const querySnapshot = await getDocs(query(collection(db, "pagamenti")));
      setPagamenti(querySnapshot.docs.map(doc => doc.data()));
    };
    if (!loading) fetchPagamenti();
  }, [loading]);

  const stats = useMemo(() => {
    if (!iscritti) return { totaleIscritti: 0, certificatiInScadenza: [], pagamentiDaSaldare: [] };

    const oggi = new Date();
    const meseCorrente = oggi.getMonth();
    
    const pagamentiMeseCorrente = pagamenti.filter(p => new Date(p.dataPagamento).getMonth() === meseCorrente && p.tipo === 'Quota Mensile');
    const pagamentiRaggruppati = pagamentiMeseCorrente.reduce((acc, p) => {
      acc[p.iscrittoId] = (acc[p.iscrittoId] || 0) + p.cifra;
      return acc;
    }, {});

    const pagamentiDaSaldare = iscritti.filter(iscritto => {
      const quotaPrevista = Number(iscritto.quotaMensile) || 0;
      if (quotaPrevista === 0) return false;
      const totalePagato = pagamentiRaggruppati[iscritto.id] || 0;
      return totalePagato < quotaPrevista;
    });

    const certificatiInScadenza = iscritti.filter(iscritto => {
      if (!iscritto.certificatoMedico?.scadenza) return false;
      const dataLimite = new Date();
      dataLimite.setDate(oggi.getDate() + 30);
      const scadenza = new Date(iscritto.certificatoMedico.scadenza);
      return scadenza >= oggi && scadenza <= dataLimite;
    });

    return {
      totaleIscritti: iscritti.length,
      certificatiInScadenza,
      pagamentiDaSaldare,
    };
  }, [iscritti, pagamenti]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  const renderList = (title, items, emptyText, icon, color, secondaryField) => (
    <Paper sx={{ p: 2, borderRadius: 4, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>{title} ({items.length})</Typography>
      </Box>
      <Divider />
      {items.length > 0 ? (
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {items.map(iscritto => {
            const secondaryText = getNestedValue(iscritto, secondaryField);
            return (
              <ListItem key={iscritto.id} component={RouterLink} to={`/iscritti?filtro=singolo&id=${iscritto.id}`} button>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: color }}>
                    {iscritto.nome ? iscritto.nome[0] : ''}
                    {iscritto.cognome ? iscritto.cognome[0] : ''}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={`${iscritto.nome} ${iscritto.cognome}`}
                  secondary={secondaryField.includes('scadenza') ? `Scadenza: ${new Date(secondaryText).toLocaleDateString('it-IT')}` : `Quota: ${secondaryText}€`}
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ pt: 2, textAlign: 'center' }}>{emptyText}</Typography>
      )}
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      {iscritti.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nessun iscritto trovato.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StatCard title="Totale Iscritti Attivi" value={stats.totaleIscritti} icon={<PeopleIcon />} color="primary.main" />
          </Grid>
          <Grid item xs={12} md={6}>
            {renderList(
              "Pagamenti da Saldare (Mese Corrente)",
              stats.pagamentiDaSaldare,
              "Nessun pagamento da saldare.",
              <PaymentIcon color="error" />,
              "error.main",
              "quotaMensile"
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderList(
              "Certificati in Scadenza (30gg)",
              stats.certificatiInScadenza,
              "Nessun certificato in scadenza.",
              <WarningIcon color="warning" />,
              "warning.main",
              "certificatoMedico.scadenza"
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default DashboardPage;