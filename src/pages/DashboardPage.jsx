// File: src/pages/DashboardPage.jsx (AGGIORNATO)

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
// NUOVE ICONE
import ArchiveIcon from "@mui/icons-material/Archive"; 
import EventNoteIcon from "@mui/icons-material/EventNote"; 
import EuroIcon from "@mui/icons-material/Euro"; 
import moment from "moment";
import 'moment/locale/it'; // Manteniamo l'import del locale per il resto del codice

// SOLUZIONE FAIL-SAFE PER IL NOME DEL MESE:
const MesiItaliani = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

moment.locale('it'); // Impostazione del locale per moment

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

// AGGIUNTA NUOVI PROPS
function DashboardPage({ 
    iscritti, 
    loading, 
    gruppi, 
    pagamenti,
    iscrittiArchiviati = [], 
    staff = [], 
    agendaEvents = [], 
    presenzeTecnici = [] 
}) {
  const theme = useTheme(); 
  const oggi = moment();

  const stats = useMemo(() => {
    
    const giornoOggi = oggi.day();
    const primoGiornoMese = oggi.clone().startOf('month');
    const ultimoGiornoMese = oggi.clone().endOf('month');
    
    // ANNO SPORTIVO
    const annoCorrente = oggi.year();
    const meseCorrente = oggi.month();
    const annoInizioSportivo = meseCorrente < 8 ? annoCorrente - 1 : annoCorrente;
    // L'anno sportivo va da Settembre (mese 8) a Giugno (mese 5)
    const inizioAnnoSportivo = moment().year(annoInizioSportivo).month(8).date(1).startOf('day'); 
    const fineAnnoSportivo = moment().year(annoInizioSportivo + 1).month(5).date(30).endOf('day'); 


    // Filtri certificati (MANTENUTI)
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

    // Filtri abbonamenti scaduti (AGGIORNATO CON TOLLERANZA)
    const abbonamentiScaduti = iscritti.filter((iscritto) => {
      if (!iscritto.abbonamento?.scadenza) return false;
      const scadenza = moment(iscritto.abbonamento.scadenza);
      // Un abbonamento è considerato scaduto solo se sono passati 7 giorni dalla sua scadenza
      return scadenza.clone().add(7, "days").isBefore(oggi, "day");
    });

    // 1. Dati finanziari (Incasso Totale Complessivo)
    const incassoTotale = pagamenti.reduce(
      (acc, p) => acc + (parseFloat(p.cifra) || 0),
      0
    );

    // 1b. Incasso Mese Corrente
    const incassoMeseCorrente = pagamenti
      .filter((p) => {
        if (!p.dataPagamento) return false;
        const dataPagamento = moment(p.dataPagamento);
        return dataPagamento.isBetween(primoGiornoMese, ultimoGiornoMese, 'day', '[]');
      })
      .reduce((acc, p) => acc + (parseFloat(p.cifra) || 0), 0);

    // 1c. Incasso Anno Sportivo
    const pagamentiAnnoSportivo = pagamenti
        .filter((p) => {
            if (!p.dataPagamento) return false;
            const dataPagamento = moment(p.dataPagamento);
            return dataPagamento.isBetween(inizioAnnoSportivo, fineAnnoSportivo, 'day', '[]');
        })
    const incassoAnnoSportivo = pagamentiAnnoSportivo.reduce((acc, p) => acc + (parseFloat(p.cifra) || 0), 0);


    // 2. Costo Personale
    let costoPersonaleMeseCorrente = 0;
    let costoPersonaleAnnoSportivo = 0; 
    
    const staffMap = staff.reduce((map, t) => {
        map[t.id] = parseFloat(t.pagaOraria) || 0;
        return map;
    }, {});

    // PresenzeTecnici is expected to be available via props
    presenzeTecnici.forEach(p => {
        if (p.status === 'Presente' && p.start) {
            const dataPresenza = moment(p.start);
            const pagaOraria = staffMap[p.tecnicoId] || 0;
            const oreLavorate = parseFloat(p.oreLavorate) || 0;

            if (dataPresenza.isBetween(primoGiornoMese, ultimoGiornoMese, 'day', '[]')) {
                costoPersonaleMeseCorrente += (pagaOraria * oreLavorate);
            }
            if (dataPresenza.isBetween(inizioAnnoSportivo, fineAnnoSportivo, 'day', '[]')) {
                costoPersonaleAnnoSportivo += (pagaOraria * oreLavorate);
            }
        }
    });


    // 3. Prossimo Evento Agenda
    const prossimoEvento = agendaEvents
        .map(e => ({
            ...e,
            startMoment: moment(e.start),
        }))
        .filter(e => e.startMoment.isSameOrAfter(oggi, 'day'))
        .sort((a, b) => a.startMoment.valueOf() - b.startMoment.valueOf())[0] || null;

    // Orari (MANTENUTI)
    const orariDiOggi = gruppi
      .filter((g) => g.giornoSettimana === giornoOggi)
      .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));

    // Scadenze per la lista dettagliata (MANTENUTI + ABBONAMENTI IN SCADENZA)
    const abbonamentiInScadenza = iscritti.filter((i) => {
        if (!i.abbonamento?.scadenza) return false;
        const scadenza = moment(i.abbonamento.scadenza);
        return (
          scadenza.isSameOrAfter(oggi, "day") && scadenza.diff(oggi, "days") <= 7 // 7 giorni per la lista
        );
      });

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
      ...abbonamentiInScadenza.map((i) => ({
        ...i,
        tipoScadenza: "Abbonamento",
        scadenzaData: moment(i.abbonamento.scadenza),
        isScaduto: false,
      })),
    ].sort((a, b) => a.scadenzaData.diff(b.scadenzaData));

    // Ultimi Pagamenti (MANTENUTI)
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
    

    return {
      totaleIscritti: iscritti.length,
      totaleArchiviati: iscrittiArchiviati.length, 
      totaleGruppi: gruppi.length,
      certificatiInScadenzaCount: certificatiInScadenza.length,
      certificatiScadutiCount: certificatiScaduti.length,
      certificatiOKCount: certificatiOK.length,
      abbonamentiScadutiCount: abbonamentiScaduti.length,
      totaleIncassato: incassoTotale, // Totale Complessivo Mantenuto
      incassoMeseCorrente: incassoMeseCorrente, 
      costoPersonaleMeseCorrente: costoPersonaleMeseCorrente, 
      incassoAnnoSportivo: incassoAnnoSportivo,
      costoPersonaleAnnoSportivo: costoPersonaleAnnoSportivo,
      prossimoEvento: prossimoEvento, 
      orariDiOggi,
      scadenzeDaVisualizzare,
      pagamentiRecenti,
    };
  }, [iscritti, gruppi, pagamenti, iscrittiArchiviati, staff, presenzeTecnici, agendaEvents, oggi]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ALTEZZA FISSA PER ALLINEAMENTO PERFETTO
  const cardMinHeight = { xs: "auto", md: "300px" }; 
  const detailCardStyle = {
    p: 3,
    borderRadius: 4,
    elevation: 0,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "background.paper",
    minHeight: cardMinHeight, 
  };
  
  // Nome del mese corrente in italiano (Utilizzo la soluzione fail-safe)
  const meseIndice = oggi.month();
  const nomeMeseCorrente = MesiItaliani[meseIndice];
  const annoSportivoDisplay = `${oggi.month() < 8 ? oggi.year() - 1 : oggi.year()}/${oggi.month() < 8 ? oggi.year() : oggi.year() + 1}`;


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

      {/* RIGA 1: ANAGRAFICA & CASSA */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        
        {/* COLONNA 1: ANAGRAFICA & CORSI - md={6} */}
        <Grid item xs={12} md={6}>
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
              {/* NUOVO: Atleti Archiviati */}
              <Grid item xs={6}>
                <CountCard
                  title="Atleti Archiviati"
                  count={stats.totaleArchiviati}
                  path="/archivio"
                  icon={ArchiveIcon}
                  color={theme.palette.text.secondary}
                />
              </Grid>
              {/* Stato Certificati */}
              <Grid item xs={6}>
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
                    sx={{ fontWeight: "bold", fontSize: '1rem' }}
                  >
                    Stato Certificati
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    {/* CHIP AGGIUNTO: Certificati in Scadenza */}
                    <Chip
                      label={`In Scadenza: ${stats.certificatiInScadenzaCount}`}
                      icon={<WarningIcon />}
                      color="warning"
                      size="small"
                    />
                    <Chip
                      label={`OK: ${stats.certificatiOKCount}`}
                      icon={<CheckCircleIcon />}
                      color="success"
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

        {/* COLONNA 2: RIEPILOGO CASSA & COSTI (METRICHE ANNUALI e MENSILI SEPARATE in blocchi) - md={6} */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Riepilogo Finanziario
          </Typography>
          <Paper sx={detailCardStyle}>
            
            {/* --- BLOCCO 1: METRICHE ANNUALI (HIGHLIGHTED) --- */}
            <Paper 
              elevation={3} // Evidenziazione visiva
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2, 
                backgroundColor: theme.palette.primary.main + '10', // Sfondo leggero
                borderLeft: `5px solid ${theme.palette.primary.main}` // Bordo di rilievo
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: theme.palette.primary.main }}>
                  Anno Sportivo ({annoSportivoDisplay})
              </Typography>
              {/* GRID INTERNA per i dati */}
              <Grid container spacing={1}> 
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Incasso Annuale</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.success.main }}>
                      €{stats.incassoAnnoSportivo.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Costo Personale</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.error.main }}>
                      €{stats.costoPersonaleAnnoSportivo.toFixed(2)}
                    </Typography>
                  </Grid>
              </Grid>
            </Paper>

            {/* --- BLOCCO 2: METRICHE MENSILI (STANDARD) --- */}
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2, 
                border: `1px solid ${theme.palette.divider}` 
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Mese di {nomeMeseCorrente}
              </Typography>
              {/* GRID INTERNA per i dati */}
              <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Incasso Mese</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: theme.palette.success.main }}>
                      €{stats.incassoMeseCorrente.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Costo Personale</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: theme.palette.error.main }}>
                      €{stats.costoPersonaleMeseCorrente.toFixed(2)}
                    </Typography>
                  </Grid>
              </Grid>
            </Paper>
            
            <Divider sx={{ my: 2 }} />

            {/* --- ABBONAMENTI SCADUTI E BOTTONE (MANTENUTI) --- */}
            <Grid container spacing={1}>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
                    <Button
                      component={RouterLink}
                      to="/iscritti?filtro=abbonamenti_scaduti"
                      fullWidth
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                    >
                      Visualizza Report Completo
                    </Button>
                </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* RIGA 2: ATTIVITÀ GIORNALIERE, SCADENZE E PAGAMENTI - Tutto md={4} */}
      <Grid container spacing={3}>
        
        {/* NUOVA COLONNA 1: ATTIVITÀ GIORNALIERE (Spostata da sopra) - md={4} */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Attività Giornaliere
          </Typography>
          <Paper sx={detailCardStyle}>
            {/* Prossimo Evento Agenda (NUOVO) */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: theme.palette.primary.main }}>
                    <EventNoteIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: "bold" }}>
                        Prossimo Evento
                    </Typography>
                </Box>
                {stats.prossimoEvento ? (
                    <Box sx={{ borderLeft: `3px solid ${theme.palette.primary.main}`, pl: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {stats.prossimoEvento.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stats.prossimoEvento.startMoment.format('ddd DD/MM HH:mm')}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                        Nessun evento in agenda.
                    </Typography>
                )}
            </Box>
            
            <Divider sx={{ my: 2 }} />

            {/* Orari di Oggi (MANTENUTO) */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarTodayIcon color="secondary" />
              <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                Orari di {giorni[new Date().getDay()]}
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 150, overflow: "auto" }}> {/* Altezza ridotta per allineamento */}
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
        
        {/* COLONNA 2: SCADENZE DA CONTROLLARE - md={4} */}
        <Grid item xs={12} md={4}>
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
                          // NEW: Evidenziazione riga basata su SCADUTO/IN SCADENZA
                          backgroundColor: item.isScaduto 
                                            ? theme.palette.error.main + '10' 
                                            : theme.palette.warning.main + '10', // Usa sempre warning light per non scaduto
                          borderRadius: 1,
                          mb: 0.5,
                          p: 1.5,
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            backgroundColor: item.isScaduto 
                                            ? theme.palette.error.main + '20' 
                                            : theme.palette.action.hover,
                          }
                        }}
                      >
                        <ListItemText
                          primary={`${item.nome} ${item.cognome}`}
                          secondary={`Scadenza ${
                            item.tipoScadenza
                          }: ${item.scadenzaData.format("DD/MM/YYYY")}`}
                          primaryTypographyProps={{ fontWeight: "bold" }}
                          sx={{ flex: "1 1 auto", pr: 2 }}
                        />
                        <Chip
                          label={item.isScaduto ? "SCADUTO" : "IN SCADENZA"}
                          color={item.isScaduto ? "error" : "warning"}
                          size="small"
                          sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
                        />
                      </ListItem>
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

        {/* COLONNA 3: ULTIMI PAGAMENTI REGISTRATI - md={4} */}
        <Grid item xs={12} md={4}>
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