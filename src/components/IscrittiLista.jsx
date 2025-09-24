// File: src/components/IscrittiLista.jsx

import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardActionArea,
  Typography,
  Grid,
  Box,
  Checkbox,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
import moment from "moment";

function IscrittiLista({
  iscritti = [],
  onSelect, 
  selection = [], 
  activeFilter,
}) {
  const theme = useTheme();

  const handleCheckboxClick = (e, id) => {
    e.stopPropagation();
    onSelect(id);
  };

  const getCertificatoStatus = (certificato) => {
    if (!certificato?.presente) {
      return { label: "Certificato Mancante", color: "error" };
    }
    if (!certificato.scadenza) {
      return { label: "Scadenza Non Imp.", color: "error" };
    }
    const oggi = moment();
    const scadenza = moment(certificato.scadenza);
    if (scadenza.isBefore(oggi, "day")) {
      return { label: "Certificato Scaduto", color: "error" };
    }
    if (
      scadenza.isSameOrAfter(oggi, "day") &&
      scadenza.diff(oggi, "days") <= 30
    ) {
      return { label: "Certificato in Scadenza", color: "warning" };
    }
    return { label: "Certificato OK", color: "success" };
  };

  const getAbbonamentoStatus = (abbonamento) => {
    if (!abbonamento?.scadenza) {
      return { label: "Non Attivo", color: "default" };
    }
    const oggi = moment();
    const scadenza = moment(abbonamento.scadenza);
    if (scadenza.isBefore(oggi, "day")) {
      return { label: "Scaduto", color: "error" };
    }
    if (
      scadenza.isSameOrAfter(oggi, "day") &&
      scadenza.diff(oggi, "days") <= 7
    ) {
      return { label: "In scadenza", color: "warning" };
    }
    return { label: "Attivo", color: "success" };
  };

  const getScadenzaText = (iscritto, filter) => {
    let scadenzaDate = null;
    let scadenzaType = "";

    if (filter.includes("abbonamenti") && iscritto.abbonamento?.scadenza) {
      scadenzaDate = moment(iscritto.abbonamento.scadenza);
      scadenzaType = "Abbonamento";
    } else if (
      filter.includes("certificati") &&
      iscritto.certificatoMedico?.scadenza
    ) {
      scadenzaDate = moment(iscritto.certificatoMedico.scadenza);
      scadenzaType = "Certificato";
    } else {
      return `Sede: ${iscritto.sede || "N/D"}`;
    }

    if (scadenzaDate) {
      return `Scadenza ${scadenzaType}: ${scadenzaDate.format("DD/MM/YYYY")}`;
    }

    return `Sede: ${iscritto.sede || "N/D"}`;
  };

  return (
    <Grid container spacing={3}>
      {iscritti.map((iscritto) => {
        const isSelected = selection.includes(iscritto.id);
        const certificatoStatus = getCertificatoStatus(
          iscritto.certificatoMedico
        );
        const abbonamentoStatus = getAbbonamentoStatus(iscritto.abbonamento);

        // STILE SCHEDA SELEZIONATA: Arrotondamento ridotto e bordi chiari
        // Utilizziamo un arrotondamento molto basso (4px) per renderla rettangolare
        const selectedStyle = isSelected ? {
            backgroundColor: theme.palette.primary.main + '20', 
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 4, // Arrotondamento minimo
            minHeight: 140, // Altezza minima standard
        } : {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4, // Arrotondamento minimo anche quando non selezionato
            minHeight: 140, // Altezza minima standard
        };

        return (
          <Grid item xs={12} sm={6} md={4} key={iscritto.id}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s",
                ...selectedStyle,
              }}
            >
              {/* CardActionArea ora avvolge solo il contenuto cliccabile per il dettaglio */}
              <CardActionArea
                component={RouterLink}
                to={`/iscritti/${iscritto.id}`}
                sx={{ flexGrow: 1, p: 2 }}
              >
                {/* Checkbox per la selezione in alto a destra */}
                <Checkbox
                  checked={isSelected}
                  onClick={(e) => handleCheckboxClick(e, iscritto.id)}
                  sx={{ 
                    position: "absolute", 
                    top: 4, 
                    right: 4, 
                    zIndex: 2,
                    color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary 
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{ fontWeight: "bold", mb: 0.5, pr: "30px", color: theme.palette.primary.main }} // Nome Primary
                  >
                    {iscritto.nome} {iscritto.cognome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getScadenzaText(iscritto, activeFilter)}
                  </Typography>
                  {/* NUOVI CAMPI VISUALIZZATI */}
                  {(iscritto.livello || iscritto.categoria) && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          {iscritto.livello && <Chip label={`Livello: ${iscritto.livello}`} size="small" variant="outlined" sx={{ color: theme.palette.text.primary, borderColor: theme.palette.primary.main }} />}
                          {iscritto.categoria && <Chip label={`Cat.: ${iscritto.categoria}`} size="small" variant="outlined" sx={{ color: theme.palette.text.primary, borderColor: theme.palette.secondary.main }} />}
                      </Stack>
                  )}
                </Box>
              </CardActionArea>
              {/* Stack rimane come footer di stato */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ p: 2, pt: 0, mt: "auto" }}
              >
                <Chip
                  label={abbonamentoStatus.label}
                  color={abbonamentoStatus.color}
                  size="small"
                  sx={{ flex: 1, fontWeight: "bold" }}
                />
                <Chip
                  label={certificatoStatus.label}
                  color={certificatoStatus.color}
                  size="small"
                  sx={{ flex: 1, fontWeight: "bold" }}
                />
              </Stack>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default IscrittiLista;