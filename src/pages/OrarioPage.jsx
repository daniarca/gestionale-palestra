// File: src/pages/OrarioPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query } from "firebase/firestore"; 
import { db } from '../firebase.js';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Paper, Grid, useTheme } from '@mui/material';

const giorniSettimana = [
  { label: 'Lunedì', value: 1 }, { label: 'Martedì', value: 2 }, { label: 'Mercoledì', value: 3 },
  { label: 'Giovedì', value: 4 }, { label: 'Venerdì', value: 5 }, { label: 'Sabato', value: 6 }
];
const orari = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

function OrarioPage() {
  const [gruppi, setGruppi] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchGruppi = async () => {
      const q = query(collection(db, "gruppi"));
      const querySnapshot = await getDocs(q);
      setGruppi(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchGruppi();
  }, []);

  const eventiPerGiorno = useMemo(() => {
    const eventi = {};
    giorniSettimana.forEach(g => eventi[g.value] = []);
    gruppi.forEach(g => {
      if (g.giornoSettimana != null && g.oraInizio) {
        eventi[g.giornoSettimana].push(g);
      }
    });
    // Ordina gli eventi per ora di inizio
    for (const giorno in eventi) {
      eventi[giorno].sort((a, b) => (a.oraInizio > b.oraInizio) ? 1 : -1);
    }
    return eventi;
  }, [gruppi]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Orario Settimanale</Typography>
      <Paper sx={{ p: 2, borderRadius: 4, backgroundColor: 'background.default' }}>
        <Grid container spacing={1}>
          {giorniSettimana.map(giorno => (
            <Grid item xs={12} md={2} key={giorno.value}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>{giorno.label}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {eventiPerGiorno[giorno.value].map(gruppo => (
                  <Paper
                    key={gruppo.id}
                    component={RouterLink}
                    to={`/iscritti?gruppoId=${gruppo.id}`}
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: gruppo.sede === 'Frascati' ? 'primary.main' : 'info.main',
                      color: '#1E1E2E',
                      textDecoration: 'none',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.03)' }
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold' }}>{gruppo.nome}</Typography>
                    <Typography variant="body2">{gruppo.oraInizio} - {gruppo.oraFine}</Typography>
                    <Typography variant="caption">{gruppo.staffNome}</Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

export default OrarioPage;