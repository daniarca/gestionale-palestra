// src/pages/OrarioPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase.js";
import { Link as RouterLink } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  useTheme,
  Chip,
  Divider,
} from "@mui/material";
import { AccessTime, LocationOn } from "@mui/icons-material";

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
      default: theme.palette.grey[600],
    }),
    [theme]
  );

  useEffect(() => {
    const fetchGruppi = async () => {
      const q = query(collection(db, "gruppi"));
      const querySnapshot = await getDocs(q);
      const gruppiData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGruppi(gruppiData);
    };
    fetchGruppi();
  }, []);

  // 🎯 Genera eventi per giorno in base a slots multipli
  const eventiPerGiorno = useMemo(() => {
    const eventi = {};
    giorniSettimana.forEach((g) => (eventi[g.value] = []));

    gruppi.forEach((g) => {
      // Se il gruppo ha nuovi slots multipli
      if (Array.isArray(g.slots) && g.slots.length > 0) {
        g.slots.forEach((slot) => {
          if (slot.giorno && slot.oraInizio && eventi[slot.giorno]) {
            eventi[slot.giorno].push({
              ...g,
              oraInizio: slot.oraInizio,
              oraFine: slot.oraFine,
              giornoSettimana: slot.giorno,
            });
          }
        });
      }
      // Compatibilità con vecchi gruppi
      else if (g.giornoSettimana && g.oraInizio && eventi[g.giornoSettimana]) {
        eventi[g.giornoSettimana].push(g);
      }
    });

    // Ordina per orario
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 2,
        }}
      >
        {giorniSettimana.map((giorno) => (
          <Paper
            key={giorno.value}
            sx={{
              p: 2,
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              display: "flex",
              flexDirection: "column",
              minHeight: "200px",
              boxShadow: theme.shadows[1],
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{
                mb: 2,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {giorno.label}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing(1.5),
              }}
            >
              {eventiPerGiorno[giorno.value].length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ pt: 1 }}
                >
                  Nessun corso
                </Typography>
              ) : (
                eventiPerGiorno[giorno.value].map((gruppo, index) => {
                  const sedeKey =
                    gruppo.sede?.toLowerCase().includes("rocca")
                      ? "roccaPriora"
                      : gruppo.sede?.toLowerCase().includes("frascati")
                      ? "frascati"
                      : "default";
                  const backgroundColor =
                    colorPalette[sedeKey] || colorPalette.default;

                  return (
                    <Paper
                      key={`${gruppo.id}-${index}`}
                      component={RouterLink}
                      to={`/iscritti?gruppoId=${gruppo.id}`}
                      elevation={2}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor,
                        color: theme.palette.getContrastText(backgroundColor),
                        textDecoration: "none",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: theme.shadows[5],
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          mb: 0.5,
                          overflowWrap: "break-word",
                        }}
                      >
                        {gruppo.nome}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <AccessTime fontSize="small" />
                        <Typography variant="body2">
                          {gruppo.oraInizio} - {gruppo.oraFine}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: "italic",
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}
                      >
                        {gruppo.staffNome || "Allenatore non assegnato"}
                      </Typography>

                      {gruppo.sede && (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            icon={<LocationOn sx={{ color: "inherit" }} />}
                            label={gruppo.sede}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: theme.palette.getContrastText(backgroundColor),
                              borderColor: theme.palette.getContrastText(backgroundColor),
                            }}
                          />
                        </Box>
                      )}
                    </Paper>
                  );
                })
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default OrarioPage;
