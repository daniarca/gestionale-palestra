import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase.js";
import { Link as RouterLink } from "react-router-dom";
import { Typography, Box, Paper, useTheme, Grid } from "@mui/material";

const giorniSettimana = [
  { label: "Lunedì", value: 1 },
  { label: "Martedì", value: 2 },
  { label: "Mercoledì", value: 3 },
  { label: "Giovedì", value: 4 },
  { label: "Venerdì", value: 5 },
  { label: "Sabato", value: 6 },
];
// Orari non utilizzati in questa pagina, ma mantenuti per consistenza se necessario
const orari = Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); 

function OrarioPage() {
  const [gruppi, setGruppi] = useState([]);
  // Rimosso: [focusedGroupId, setFocusedGroupId]
  const theme = useTheme();

  // La colorPalette non è più strettamente necessaria ma manteniamo i colori semantici per sede
  const colorPalette = useMemo(
    () => ({
      frascati: theme.palette.primary.main,
      roccaPriora: theme.palette.secondary.main, // Usiamo secondary per il contrasto
    }),
    [theme]
  );
  
  useEffect(() => {
    const fetchGruppi = async () => {
      const q = query(collection(db, "gruppi"));
      const querySnapshot = await getDocs(q);
      setGruppi(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchGruppi();
  }, []);
  
  // Rimosso: handleFocus

  const eventiPerGiorno = useMemo(() => {
    const eventi = {};
    giorniSettimana.forEach((g) => (eventi[g.value] = []));
    gruppi.forEach((g) => {
      // FIX: Controllo per assicurare che la chiave esista nell'oggetto eventi
      if (g.giornoSettimana != null && g.oraInizio && eventi[g.giornoSettimana]) {
          eventi[g.giornoSettimana].push(g);
      }
    });
    for (const giorno in eventi) {
      // Ordina gli eventi per ora di inizio (necessario per l'elenco sequenziale)
      eventi[giorno].sort((a, b) => (a.oraInizio > b.oraInizio ? 1 : -1));
    }
    return eventi;
  }, [gruppi]);
  
  // Rimosso: eventBlocksPerDay

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Orario Settimanale
      </Typography>

      <Paper
        sx={{
          p: 2,
          borderRadius: 4,
          backgroundColor: "background.default",
          overflowX: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            // Ristabilito layout Grid per un layout più pulito e coerente con la tua architettura
            minWidth: `${giorniSettimana.length * 250}px`,
          }}
        >
          {giorniSettimana.map((giorno) => (
            <Box
              key={giorno.value}
              sx={{
                flexGrow: 1,
                flexShrink: 0,
                minWidth: "250px",
                padding: theme.spacing(1),
                borderRight: `1px solid ${theme.palette.divider}`,
                "&:last-of-type": {
                  borderRight: "none",
                },
              }}
            >
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                {giorno.label}
              </Typography>
              
              {/* Contenitore per gli Eventi: Ritorno all'incolonnamento standard */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing(1),
                }}
              >
                {eventiPerGiorno[giorno.value].map((gruppo) => {
                  
                  const sedeKey = gruppo.sede === 'Frascati' ? 'frascati' : 'roccaPriora';
                  const backgroundColor = colorPalette[sedeKey] || theme.palette.primary.main;

                  return (
                      <Paper
                          key={gruppo.id}
                          component={RouterLink}
                          to={`/iscritti?gruppoId=${gruppo.id}`}
                          elevation={3}
                          sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: backgroundColor,
                              color: '#FFFFFF', // FIX: Testo sempre Bianco
                              textDecoration: "none",
                              transition: "transform 0.2s",
                              "&:hover": { transform: "scale(1.03)" },
                          }}
                      >
                          <Typography sx={{ fontWeight: "bold", overflowWrap: "break-word" }}>
                              {gruppo.nome}
                          </Typography>
                          <Typography variant="body2">
                              {gruppo.oraInizio} - {gruppo.oraFine}
                          </Typography>
                          <Typography variant="caption">
                              {gruppo.staffNome}
                          </Typography>
                      </Paper>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default OrarioPage;