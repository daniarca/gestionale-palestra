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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";
import PaymentIcon from "@mui/icons-material/Payment";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import StatCard from "../components/StatCard.jsx";
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

function DashboardPage({ iscritti, loading, gruppi, pagamenti, staff }) {
  const stats = useMemo(() => {
    const oggi = moment();
    const giornoOggi = oggi.day();

    // Filtri per certificati in scadenza e scaduti
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

    // Filtri per abbonamenti in scadenza e scaduti
    const abbonamentiInScadenza = iscritti.filter((iscritto) => {
      if (!iscritto.abbonamento?.scadenza) return false;
      const scadenza = moment(iscritto.abbonamento.scadenza);
      return (
        scadenza.isSameOrAfter(oggi, "day") && scadenza.diff(oggi, "days") <= 30
      );
    });

    const abbonamentiScaduti = iscritti.filter((iscritto) => {
      if (!iscritto.abbonamento?.scadenza) return false;
      const scadenza = moment(iscritto.abbonamento.scadenza);
      return scadenza.isBefore(oggi, "day");
    });

    // Dati finanziari
    const totaleIncassato = pagamenti.reduce((acc, p) => acc + p.cifra, 0);

    const orariDiOggi = gruppi
      .filter((g) => g.giornoSettimana === giornoOggi)
      .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));

    const ultimiIscritti = iscritti
      .sort((a, b) => new Date(b.dataIscrizione) - new Date(a.dataIscrizione))
      .slice(0, 5);

    const pagamentiRecenti = pagamenti
      .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento))
      .slice(0, 5);

    // Crea un'unica lista di scadenze combinate
    const scadenzeDaVisualizzare = [
      ...abbonamentiScaduti.map((i) => ({
        ...i,
        tipoScadenza: "Abbonamento",
        isScaduto: true,
      })),
      ...certificatiScaduti.map((i) => ({
        ...i,
        tipoScadenza: "Certificato Medico",
        isScaduto: true,
      })),
      ...abbonamentiInScadenza.map((i) => ({
        ...i,
        tipoScadenza: "Abbonamento",
        isScaduto: false,
      })),
      ...certificatiInScadenza.map((i) => ({
        ...i,
        tipoScadenza: "Certificato Medico",
        isScaduto: false,
      })),
    ].sort(
      (a, b) =>
        new Date(a.scadenza || a.certificatoMedico.scadenza) -
        new Date(b.scadenza || b.certificatoMedico.scadenza)
    );

    return {
      totaleIscritti: iscritti.length,
      certificatiDaControllare:
        certificatiScaduti.length + certificatiInScadenza.length,
      abbonamentiScaduti: abbonamentiScaduti,
      totaleIncassato,
      ultimiIscritti,
      orariDiOggi,
      pagamentiRecenti,
      scadenzeDaVisualizzare,
    };
  }, [iscritti, pagamenti, gruppi, staff]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Dashboard
      </Typography>

      {/* MACRO GRUPPO 1: Riepilogo Statistiche e Azioni */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Riepilogo e Azioni Rapide
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Totale Iscritti"
              value={stats.totaleIscritti}
              icon={<PeopleIcon />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Certificati da Controllare"
              value={stats.certificatiDaControllare}
              icon={<WarningIcon />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Abbonamenti Scaduti"
              value={stats.abbonamentiScaduti.length}
              icon={<PaymentIcon />}
              color="error.main"
            />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Azioni Rapide
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
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
            to="/gruppi/nuovo"
            startIcon={<GroupAddIcon />}
          >
            Nuovo Gruppo
          </Button>
        </Stack>
      </Paper>

      {/* MACRO GRUPPO 2: Attività e Scadenze */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Attività e Scadenze
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Ultimi Iscritti
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ maxHeight: 200, overflow: "auto" }}>
              {stats.ultimiIscritti.length > 0 ? (
                <List dense>
                  {stats.ultimiIscritti.map((iscritto) => (
                    <ListItem
                      key={iscritto.id}
                      component={RouterLink}
                      to={`/iscritti/${iscritto.id}`}
                    >
                      <ListItemText
                        primary={`${iscritto.nome} ${iscritto.cognome}`}
                        secondary={iscritto.dataIscrizione}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nessun nuovo iscritto.
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Orari di Oggi ({giorni[new Date().getDay()]})
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ maxHeight: 200, overflow: "auto" }}>
              {stats.orariDiOggi.length > 0 ? (
                <List dense>
                  {stats.orariDiOggi.map((gruppo) => (
                    <ListItem key={gruppo.id}>
                      <ListItemText
                        primary={`${gruppo.oraInizio} - ${gruppo.oraFine}: ${gruppo.nome}`}
                        secondary={gruppo.staffNome}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nessun gruppo in programma per oggi.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Scadenze
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: "auto" }}>
          {stats.scadenzeDaVisualizzare.length > 0 ? (
            <List dense>
              {stats.scadenzeDaVisualizzare.map((item) => (
                <ListItem
                  key={item.id + item.tipoScadenza}
                  component={RouterLink}
                  to={`/iscritti/${item.id}`}
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <ListItemText
                    primary={`${item.nome} ${item.cognome}`}
                    secondary={`${item.tipoScadenza} ${
                      item.isScaduto ? "scaduto" : "in scadenza"
                    }: ${new Date(
                      item.isScaduto
                        ? item.abbonamento?.scadenza ||
                          item.certificatoMedico.scadenza
                        : item.abbonamento?.scadenza ||
                          item.certificatoMedico.scadenza
                    ).toLocaleDateString()}`}
                    sx={{ flex: "1 1 auto", pr: 2 }}
                  />
                  <Chip
                    label={item.isScaduto ? "Scaduto" : "In scadenza"}
                    color={item.isScaduto ? "error" : "warning"}
                    size="small"
                    sx={{ whiteSpace: "nowrap" }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nessuna scadenza imminente.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* MACRO GRUPPO 3: Riepilogo Finanziario */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Riepilogo Finanziario
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Cassa
            </Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5">
                <strong>€{stats.totaleIncassato.toFixed(2)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Totale incassato
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Ultimi Pagamenti
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ maxHeight: 200, overflow: "auto" }}>
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
                <Typography variant="body2" color="text.secondary">
                  Nessun pagamento recente.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default DashboardPage;
