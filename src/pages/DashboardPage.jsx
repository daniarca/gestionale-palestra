// File: src/pages/DashboardPage.jsx

import React, { useMemo } from "react";
import {
  Typography,
  Grid,
  Box,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Stack,
  Chip,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Groups";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssessmentIcon from "@mui/icons-material/Assessment";
import moment from "moment";

const giorni = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

// Componente Card minimalista per Atleti/Gruppi (simile ai box del competitor)
function CountCard({ title, count, path, icon: IconComponent, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        textAlign: "center",
        borderRadius: 2,
        border: `1px solid ${color}`,
        backgroundColor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 3px 6px rgba(0,0,0,0.1)`,
        },
      }}
    >
      <Box sx={{ color: color }}>
        {IconComponent && <IconComponent sx={{ fontSize: 40, mb: 1 }} />}
      </Box>
      <Typography
        variant="h3"
        sx={{ fontWeight: "bold", color: "text.primary" }}
      >
        {count}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", mb: 1 }}
      >
        {title}
      </Typography>
      <Button component={RouterLink} to={path} size="small" variant="text">
        Gestisci
      </Button>
    </Paper>
  );
}

function DashboardPage({ iscritti, loading, gruppi, pagamenti }) {
  const theme = useTheme(); // Usa il tema per i colori

  const stats = useMemo(() => {
    const oggi = moment();
    const giornoOggi = oggi.day();

    // Filtri certificati
    const certificatiInScadenza = iscritti.filter((iscritto) => {
      if (!iscritto.certificatoMedico?.scadenza) return false;
      const scadenza = moment(iscritto.certificatoMedico.scadenza);
      return (
        scadenza.isSameOrAfter(oggi, "day") && scadenza.diff(oggi, "days") <= 30
      );
    });

    const certificatiScaduti = iscritti.filter((iscritto) => {
      if (!iscritto.certificatoMedico?.scadenza) return false;
      const scadenza = moment(iscritto.certificatoMedico.scadenza);
      return scadenza.isBefore(oggi, "day");
    });

    const certificatiOK = iscritti.filter((iscritto) => {
      if (!iscritto.certificatoMedico?.scadenza) return false;
      const scadenza = moment(iscritto.certificatoMedico.scadenza);
      return scadenza.isAfter(oggi.clone().add(30, "days"), "day");
    });

    // Filtri abbonamenti scaduti
    const abbonamentiScaduti = iscritti.filter((iscritto) => {
      if (!iscritto.abbonamento?.scadenza) return false;
      const scadenza = moment(iscritto.abbonamento.scadenza);
      return scadenza.isBefore(oggi, "day");
    });

    // Dati finanziari
    const incassoTotale = pagamenti.reduce(
      (acc, p) => acc + (parseFloat(p.cifra) || 0),
      0
    );

    // Orari
    const orariDiOggi = gruppi
      .filter((g) => g.giornoSettimana === giornoOggi)
      .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));

    // Scadenze per la lista dettagliata
    const scadenzeDaVisualizzare = [
      ...certificatiScaduti.map((i) => ({
        ...i,
        tipoScadenza: "Certificato Medico",
        scadenzaData: moment(i.certificatoMedico.scadenza),
        isScaduto: true,
      })),
      ...certificatiInScadenza.map((i) => ({
        ...i,
        tipoScadenza: "Certificato Medico",
        scadenzaData: moment(i.certificatoMedico.scadenza),
        isScaduto: false,
      })),
      ...abbonamentiScaduti.map((i) => ({
        ...i,
        tipoScadenza: "Abbonamento",
        scadenzaData: moment(i.abbonamento.scadenza),
        isScaduto: true,
      })),
    ].sort((a, b) => a.scadenzaData.diff(b.scadenzaData));

    // --- INIZIO FIX ---
    // 1. Filtra via i pagamenti con date future per non "inquinare" la lista.
    // 2. Crea una copia dell'array prima di ordinarlo per evitare mutazioni.
    const pagamentiRecenti = [...pagamenti]
      .filter(
        (p) =>
          p.dataPagamento && moment(p.dataPagamento).isSameOrBefore(oggi, "day")
      )
      .sort(
        (a, b) =>
          moment(b.dataPagamento).valueOf() - moment(a.dataPagamento).valueOf()
      )
      .slice(0, 5);
    // --- FINE FIX ---

    return {
      totaleIscritti: iscritti.length,
      totaleGruppi: gruppi.length,
      certificatiInScadenzaCount: certificatiInScadenza.length,
      certificatiScadutiCount: certificatiScaduti.length,
      certificatiOKCount: certificatiOK.length,
      abbonamentiScadutiCount: abbonamentiScaduti.length,
      totaleIncassato: incassoTotale,
      orariDiOggi,
      scadenzeDaVisualizzare,
      pagamentiRecenti,
    };
  }, [iscritti, gruppi, pagamenti]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const cardMinHeight = { xs: "auto", md: "250px" };
  const detailCardStyle = {
    p: 3,
    borderRadius: 4,
    elevation: 0,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "background.paper",
    minHeight: cardMinHeight,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Dashboard
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "background.paper",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: "bold",
            mb: 1,
            color: theme.palette.text.secondary,
          }}
        >
          Notifiche e Azioni Rapide
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
          {stats.abbonamentiScadutiCount > 0 && (
            <Chip
              label={`${stats.abbonamentiScadutiCount} Abbonamenti Scaduti`}
              color="error"
              component={RouterLink}
              to="/iscritti?filtro=abbonamenti_scaduti"
              clickable
            />
          )}
          {stats.certificatiScadutiCount > 0 && (
            <Chip
              label={`${stats.certificatiScadutiCount} Certificati Scaduti`}
              color="error"
              component={RouterLink}
              to="/iscritti?filtro=certificati_scaduti"
              clickable
            />
          )}
          {stats.certificatiInScadenzaCount > 0 && (
            <Chip
              label={`${stats.certificatiInScadenzaCount} Certificati in Scadenza`}
              color="warning"
              component={RouterLink}
              to="/iscritti?filtro=certificati_in_scadenza"
              clickable
            />
          )}
          <Button
            variant="contained"
            component={RouterLink}
            to="/iscritti/nuovo"
            startIcon={<AddIcon />}
          >
            Nuovo Socio
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/report"
            startIcon={<AssessmentIcon />}
          >
            Report Finanziario
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Anagrafica & Corsi
          </Typography>
          <Paper sx={detailCardStyle}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <CountCard
                  title="Atleti Attivi"
                  count={stats.totaleIscritti}
                  path="/iscritti"
                  icon={PeopleIcon}
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={6}>
                <CountCard
                  title="Gruppi Totali"
                  count={stats.totaleGruppi}
                  path="/gruppi"
                  icon={GroupIcon}
                  color={theme.palette.info.main}
                />
              </Grid>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: "background.default",
                    textAlign: "center",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    Stato Certificati
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    <Chip
                      label={`OK: ${stats.certificatiOKCount}`}
                      icon={<CheckCircleIcon />}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`In Scadenza: ${stats.certificatiInScadenzaCount}`}
                      icon={<WarningIcon />}
                      color="warning"
                      size="small"
                    />
                    <Chip
                      label={`Scaduti: ${stats.certificatiScadutiCount}`}
                      icon={<WarningIcon />}
                      color="error"
                      size="small"
                    />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Riepilogo Cassa
          </Typography>
          <Paper sx={detailCardStyle}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                color: theme.palette.success.main,
              }}
            >
              <AttachMoneyIcon sx={{ fontSize: "1.2rem" }} />
              <Typography variant="body1" sx={{ ml: 1, fontWeight: "medium" }}>
                Incasso Totale Complessivo
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", color: theme.palette.success.main }}
            >
              €{stats.totaleIncassato.toFixed(2)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body1">Abbonamenti Scaduti:</Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: theme.palette.error.main }}
              >
                {stats.abbonamentiScadutiCount}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/report"
              fullWidth
              variant="outlined"
              startIcon={<AssessmentIcon />}
            >
              Visualizza Report Completo
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Orari di Oggi
          </Typography>
          <Paper sx={detailCardStyle}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarTodayIcon color="secondary" />
              <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                {giorni[new Date().getDay()]}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 200, overflow: "auto" }}>
              {stats.orariDiOggi.length > 0 ? (
                <List dense disablePadding>
                  {stats.orariDiOggi.map((gruppo) => (
                    <ListItem key={gruppo.id} disableGutters>
                      <ListItemText
                        primary={`${gruppo.oraInizio} - ${gruppo.oraFine}: ${gruppo.nome}`}
                        secondary={`Allenatore: ${
                          gruppo.staffNome || "N/D"
                        } | Sede: ${gruppo.sede || "N/D"}`}
                        primaryTypographyProps={{ fontWeight: "bold" }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 1, textAlign: "center" }}
                >
                  Nessun gruppo in programma per oggi.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Scadenze da Controllare
          </Typography>
          <Paper
            sx={{ ...detailCardStyle, minHeight: { xs: "auto", md: "450px" } }}
          >
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {stats.scadenzeDaVisualizzare.length > 0 ? (
                <List dense disablePadding>
                  {stats.scadenzeDaVisualizzare.map((item, index) => (
                    <React.Fragment key={item.id + item.tipoScadenza}>
                      <ListItem
                        component={RouterLink}
                        to={`/iscritti/${item.id}`}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <ListItemText
                          primary={`${item.nome} ${item.cognome}`}
                          secondary={`Scadenza ${
                            item.tipoScadenza
                          }: ${item.scadenzaData.format("DD/MM/YYYY")}`}
                          sx={{ flex: "1 1 auto", pr: 2 }}
                        />
                        <Chip
                          label={item.isScaduto ? "SCADUTO" : "IN SCADENZA"}
                          color={item.isScaduto ? "error" : "warning"}
                          size="small"
                          sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
                        />
                      </ListItem>
                      {index < stats.scadenzeDaVisualizzare.length - 1 && (
                        <Divider />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 2, textAlign: "center" }}
                >
                  Nessuna scadenza critica imminente.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Ultimi Pagamenti Registrati
          </Typography>
          <Paper
            sx={{ ...detailCardStyle, minHeight: { xs: "auto", md: "450px" } }}
          >
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {stats.pagamentiRecenti.length > 0 ? (
                <List dense disablePadding>
                  {stats.pagamentiRecenti.map((p, index) => (
                    <React.Fragment key={p.id || index}>
                      <ListItem disableGutters>
                        <ListItemText
                          primary={
                            <Typography
                              component="span"
                              sx={{ fontWeight: "bold" }}
                            >
                              {p.iscrittoNome}
                            </Typography>
                          }
                          secondary={moment(p.dataPagamento).format(
                            "DD/MM/YYYY"
                          )}
                        />
                        <Box sx={{ textAlign: "right" }}>
                          <Chip
                            label={`€${(p.cifra || 0).toFixed(2)}`}
                            size="small"
                            color="success"
                            sx={{ mr: 1, fontWeight: "bold" }}
                          />
                          <Chip
                            label={p.tipo || "N/D"}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </ListItem>
                      {index < stats.pagamentiRecenti.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 2, textAlign: "center" }}
                >
                  Nessun pagamento recente registrato.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
