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
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemIcon,
} from "@mui/material";
import moment from "moment";

// Funzioni di utility (le stesse di prima)
const getCertificatoStatus = (certificato) => {
  if (!certificato?.presente)
    return { label: "Certificato Mancante", color: "error" };
  if (!certificato.scadenza)
    return { label: "Scadenza Non Imp.", color: "error" };
  const oggi = moment();
  const scadenza = moment(certificato.scadenza);
  if (scadenza.isBefore(oggi, "day"))
    return { label: "Certificato Scaduto", color: "error" };
  if (scadenza.isSameOrAfter(oggi, "day") && scadenza.diff(oggi, "days") <= 30)
    return { label: "Certificato in Scadenza", color: "warning" };
  return { label: "Certificato OK", color: "success" };
};

const getAbbonamentoStatus = (abbonamento) => {
  if (!abbonamento?.scadenza) return { label: "Non Attivo", color: "default" };
  const oggi = moment();
  const scadenza = moment(abbonamento.scadenza);
  if (scadenza.isBefore(oggi, "day"))
    return { label: "Scaduto", color: "error" };
  if (scadenza.isSameOrAfter(oggi, "day") && scadenza.diff(oggi, "days") <= 7)
    return { label: "In scadenza", color: "warning" };
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
  if (scadenzaDate)
    return `Scadenza ${scadenzaType}: ${scadenzaDate.format("DD/MM/YYYY")}`;
  return `Sede: ${iscritto.sede || "N/D"}`;
};

// Componente per la singola CARD
function CardItem({ iscritto, isSelected, onSelect, activeFilter }) {
  const theme = useTheme();
  const certificatoStatus = getCertificatoStatus(iscritto.certificatoMedico);
  const abbonamentoStatus = getAbbonamentoStatus(iscritto.abbonamento);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(iscritto.id);
  };

  const selectedStyle = isSelected
    ? {
        backgroundColor: theme.palette.primary.main + "20",
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 4,
        minHeight: 140,
      }
    : {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        minHeight: 140,
      };

  return (
    <Grid item xs={12} sm={6} md={4}>
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
        <CardActionArea
          component={RouterLink}
          to={`/iscritti/${iscritto.id}`}
          sx={{ flexGrow: 1, p: 2 }}
        >
          <Checkbox
            checked={isSelected}
            onClick={handleCheckboxClick}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              zIndex: 2,
              color: isSelected
                ? theme.palette.primary.main
                : theme.palette.text.secondary,
            }}
          />
          <Box>
            <Typography
              variant="h6"
              component="p"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                pr: "30px",
                color: theme.palette.primary.main,
              }}
            >
              {iscritto.cognome} {iscritto.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getScadenzaText(iscritto, activeFilter)}
            </Typography>
            {(iscritto.livello || iscritto.categoria) && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {iscritto.livello && (
                  <Chip
                    label={`Livello: ${iscritto.livello}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.primary.main,
                    }}
                  />
                )}
                {iscritto.categoria && (
                  <Chip
                    label={`Cat.: ${iscritto.categoria}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.secondary.main,
                    }}
                  />
                )}
                {iscritto.isCalisthenics && (
                  <Avatar
                    sx={{
                      bgcolor: "secondary.main",
                      width: 24,
                      height: 24,
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >C</Avatar>
                )}
              </Stack>
            )}
          </Box>
        </CardActionArea>
        <Stack direction="row" spacing={1} sx={{ p: 2, pt: 0, mt: "auto" }}>
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
}

// Componente per la singola RIGA della lista
function ListItemRow({ iscritto, isSelected, onSelect, activeFilter }) {
  const theme = useTheme();
  const certificatoStatus = getCertificatoStatus(iscritto.certificatoMedico);
  const abbonamentoStatus = getAbbonamentoStatus(iscritto.abbonamento);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(iscritto.id);
  };

  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={abbonamentoStatus.label}
            color={abbonamentoStatus.color}
            size="small"
            sx={{ width: 120, fontWeight: "bold" }}
          />
          <Chip
            label={certificatoStatus.label}
            color={certificatoStatus.color}
            size="small"
            sx={{ width: 180, fontWeight: "bold" }}
          />
          {/* --- INIZIO CORREZIONE --- */}
          <Checkbox
            edge="end"
            checked={isSelected}
            onClick={handleCheckboxClick} // Sostituito onChange con onClick per poter fermare la propagazione del click
          />
          {/* --- FINE CORREZIONE --- */}
        </Stack>
      }
      sx={{
        backgroundColor: isSelected
          ? theme.palette.primary.main + "20"
          : theme.palette.background.paper,
        borderRadius: 2,
        mb: 1,
        border: `1px solid ${
          isSelected ? theme.palette.primary.main : theme.palette.divider
        }`,
      }}
      button
      component={RouterLink}
      to={`/iscritti/${iscritto.id}`}
    >
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography component="span" sx={{ fontWeight: "bold" }}>
              {`${iscritto.cognome} ${iscritto.nome}`}
            </Typography>
            {iscritto.livello && (
              <Chip
                label={iscritto.livello}
                size="small"
                variant="outlined"
                sx={{
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.primary.main,
                }}
              />
            )}
            {iscritto.categoria && (
              <Chip
                label={iscritto.categoria}
                size="small"
                variant="outlined"
                sx={{
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.secondary.main,
                }}
              />
            )}
            {iscritto.isCalisthenics && (
              <Avatar
                sx={{
                  bgcolor: "secondary.main",
                  width: 24,
                  height: 24,
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >C</Avatar>
            )}
          </Stack>
        }
        secondary={getScadenzaText(iscritto, activeFilter)}
      />
    </ListItem>
  );
}

function IscrittiLista({
  iscritti = [],
  onSelect,
  selection = [],
  activeFilter,
  viewMode, // Riceve la modalità di visualizzazione
}) {
  if (viewMode === "grid") {
    return (
      <Grid container spacing={3}>
        {iscritti.map((iscritto) => (
          <CardItem
            key={iscritto.id}
            iscritto={iscritto}
            isSelected={selection.includes(iscritto.id)}
            onSelect={onSelect}
            activeFilter={activeFilter}
          />
        ))}
      </Grid>
    );
  }

  return (
    <List>
      {iscritti.map((iscritto) => (
        <ListItemRow
          key={iscritto.id}
          iscritto={iscritto}
          isSelected={selection.includes(iscritto.id)}
          onSelect={onSelect}
          activeFilter={activeFilter}
        />
      ))}
    </List>
  );
}

export default IscrittiLista;