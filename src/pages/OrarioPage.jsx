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
  const [focusedGroupId, setFocusedGroupId] = useState(null);
  const theme = useTheme();

  const colorPalette = useMemo(
    () => [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ],
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

  const handleFocus = (groupId) => {
    setFocusedGroupId(groupId);
  };

  const eventiPerGiorno = useMemo(() => {
    const eventi = {};
    giorniSettimana.forEach((g) => (eventi[g.value] = []));
    gruppi.forEach((g) => {
      if (g.giornoSettimana != null && g.oraInizio) {
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
              <Box
                sx={{
                  position: "relative",
                  minHeight: "200px",
                  paddingBottom: "150px",
                }}
              >
                {eventiPerGiorno[giorno.value].map((gruppo, index) => {
                  const isFocused = gruppo.id === focusedGroupId;
                  const largeOffset = index * 30;
                  const horizontalShift = index * 10;
                  const finalZIndex = isFocused ? 100 : index;
                  const colorKey = colorPalette[index % colorPalette.length];

                  return (
                    <Paper
                      key={gruppo.id}
                      onClick={() => handleFocus(gruppo.id)}
                      elevation={isFocused ? 10 : 3}
                      sx={{
                        position: "absolute",
                        top: `${largeOffset}px`,
                        left: `${horizontalShift}px`,
                        width: `calc(100% - ${horizontalShift * 2}px)`,
                        minHeight: "80px",
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: colorKey,
                        color: theme.palette.getContrastText(colorKey),
                        cursor: "pointer",
                        zIndex: finalZIndex,
                        // --- MODIFICA CHIAVE: Transizione fluida ---
                        transition:
                          "transform 0.2s ease-in-out, z-index 0s linear 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          transition:
                            "transform 0.2s ease-in-out, z-index 0s linear 0s",
                          zIndex: 99,
                        },
                      }}
                    >
                      <RouterLink
                        to={`/iscritti?gruppoId=${gruppo.id}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          display: "block",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFocus(gruppo.id);
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            overflowWrap: "break-word",
                          }}
                        >
                          {gruppo.nome}
                        </Typography>
                        <Typography variant="body2">
                          {gruppo.oraInizio} - {gruppo.oraFine}
                        </Typography>
                        <Typography variant="caption">
                          {gruppo.staffNome}
                        </Typography>
                      </RouterLink>
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
