// File: src/pages/OrarioPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase.js";
import { Link as RouterLink } from "react-router-dom";
import { Typography, Box, Paper, useTheme } from "@mui/material";

const giorniSettimana = [
  { label: "Lunedì", value: 1 },
  { label: "Martedì", value: 2 },
  { label: "Mercoledì", value: 3 },
  { label: "Giovedì", value: 4 },
  { label: "Venerdì", value: 5 },
  { label: "Sabato", value: 6 },
];

function OrarioPage() {
  const [gruppi, setGruppi] = useState([]);
  const theme = useTheme();

  const colorPalette = useMemo(
    () => ({
      frascati: theme.palette.primary.main,
      roccaPriora: theme.palette.secondary.main,
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

  const eventiPerGiorno = useMemo(() => {
    const eventi = {};
    giorniSettimana.forEach((g) => (eventi[g.value] = []));
    gruppi.forEach((g) => {
      if (
        g.giornoSettimana != null &&
        g.oraInizio &&
        eventi[g.giornoSettimana]
      ) {
        eventi[g.giornoSettimana].push(g);
      }
    });
    for (const giorno in eventi) {
      eventi[giorno].sort((a, b) => (a.oraInizio > b.oraInizio ? 1 : -1));
    }
    return eventi;
  }, [gruppi]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Orario Settimanale
      </Typography>

      {/* Container principale che usa CSS Grid per un layout flessibile e responsivo */}
      <Box
        sx={{
          display: "grid",
          // Questa riga è la chiave:
          // 'auto-fit' cerca di inserire più colonne possibili.
          // 'minmax(250px, 1fr)' dice a ogni colonna:
          // - Sii larga ALMENO 250px.
          // - Se c'è più spazio, espanditi per riempirlo (1fr).
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 2, // Spazio tra le colonne
        }}
      >
        {giorniSettimana.map((giorno) => (
          <Paper
            key={giorno.value}
            sx={{
              p: 2,
              borderRadius: 4,
              backgroundColor: "background.default",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{ mb: 2, fontWeight: "bold" }}
            >
              {giorno.label}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing(1.5),
              }}
            >
              {eventiPerGiorno[giorno.value].map((gruppo) => {
                const sedeKey =
                  gruppo.sede === "Frascati" ? "frascati" : "roccaPriora";
                const backgroundColor =
                  colorPalette[sedeKey] || theme.palette.primary.main;

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
                      color: theme.palette.getContrastText(backgroundColor),
                      textDecoration: "none",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: theme.shadows[6],
                        cursor: "pointer",
                      },
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", overflowWrap: "break-word" }}
                    >
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
              {eventiPerGiorno[giorno.value].length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ pt: 2 }}
                >
                  Nessun corso
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default OrarioPage;
