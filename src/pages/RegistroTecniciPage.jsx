// File: src/pages/RegistroTecniciPage.jsx (Definitivo)

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Box, Paper, useTheme, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, FormControl, Select, MenuItem,
  ToggleButton, ToggleButtonGroup
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it";
import { useNotification } from "../context/NotificationContext.jsx";
import { fetchTecnici, fetchPresenzeTecnici, addPresenzaTecnico, updatePresenzaTecnico, deletePresenzaTecnico } from "../services/firebaseService.js";
import RegistroTecnicoDialog from "../components/RegistroTecnicoDialog.jsx";
import moment from "moment";
import 'moment/locale/it';

moment.locale('it');

const generaAnni = (numAnni = 5) => {
  const annoCorrente = new Date().getFullYear();
  return Array.from({ length: numAnni }, (_, i) => annoCorrente - i);
};

const MESI = [
    { nome: 'Gennaio', valore: 0 }, { nome: 'Febbraio', valore: 1 }, { nome: 'Marzo', valore: 2 },
    { nome: 'Aprile', valore: 3 }, { nome: 'Maggio', valore: 4 }, { nome: 'Giugno', valore: 5 },
    { nome: 'Luglio', valore: 6 }, { nome: 'Agosto', valore: 7 }, { nome: 'Settembre', valore: 8 },
    { nome: 'Ottobre', valore: 9 }, { nome: 'Novembre', valore: 10 }, { nome: 'Dicembre', valore: 11 }
];

function RegistroTecniciPage() {
  const [rawEvents, setRawEvents] = useState([]);
  const [tecnici, setTecnici] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const { showNotification } = useNotification();
  const theme = useTheme();
  const calendarRef = useRef(null);

  const anniDisponibili = useMemo(() => generaAnni(), []);
  const [reportMode, setReportMode] = useState('Annuale');
  const [annoReport, setAnnoReport] = useState(new Date().getFullYear());
  const [meseReport, setMeseReport] = useState(new Date().getMonth());

  const loadData = useCallback(async () => {
    try {
      const [fetchedEvents, fetchedTecnici] = await Promise.all([ fetchPresenzeTecnici(), fetchTecnici() ]);
      setRawEvents(fetchedEvents);
      setTecnici(fetchedTecnici);
    } catch (error) { showNotification("Errore nel caricamento dei dati.", "error"); }
  }, [showNotification]);

  useEffect(() => { loadData(); }, [loadData]);
  
  const calendarEvents = useMemo(() => {
    return rawEvents.map(event => {
        const tecnico = tecnici.find(t => t.id === event.tecnicoId);
        const title = `${tecnico ? tecnico.cognome : 'N/D'}: ${event.status === 'Presente' ? `${event.oreLavorate} ore` : 'Assente'}`;
        return {
            id: event.id, title, start: event.start, end: event.end, allDay: event.allDay,
            backgroundColor: event.status === 'Presente' ? theme.palette.success.main : theme.palette.error.main,
            borderColor: event.status === 'Presente' ? theme.palette.success.main : theme.palette.error.main,
            extendedProps: event,
        };
    });
  }, [rawEvents, tecnici, theme]);
  
  const reportData = useMemo(() => {
    const stats = tecnici.map(tecnico => ({
      id: tecnico.id, nome: `${tecnico.cognome} ${tecnico.nome}`,
      presenze: 0, assenze: 0, oreTotali: 0,
    }));

    rawEvents.forEach(event => {
      const eventDate = moment(event.start);
      const isCorrectYear = eventDate.year() === annoReport;
      const isCorrectMonth = eventDate.month() === meseReport;

      if (isCorrectYear && (reportMode === 'Annuale' || isCorrectMonth)) {
        const statTecnico = stats.find(s => s.id === event.tecnicoId);
        if (statTecnico) {
          if (event.status === 'Presente') {
            statTecnico.presenze += 1;
            statTecnico.oreTotali += parseFloat(event.oreLavorate) || 0;
          } else if (event.status === 'Assente') {
            statTecnico.assenze += 1;
          }
        }
      }
    });
    // --- INIZIO CORREZIONE ---
    return stats; // Questa riga mancava e causava il crash.
    // --- FINE CORREZIONE ---
  }, [rawEvents, tecnici, annoReport, meseReport, reportMode]);

  const handleDateClick = (arg) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && calendarApi.view.type === 'customYear') {
      calendarApi.changeView('dayGridMonth', arg.date);
    } else {
      setSelectedDateInfo(arg);
      setSelectedEvent(null);
      setDialogOpen(true);
    }
  };
  
  const handleEventClick = (clickInfo) => { setSelectedEvent(clickInfo.event.extendedProps); setSelectedDateInfo(null); setDialogOpen(true); };
  const handleDialogClose = () => { setDialogOpen(false); setSelectedEvent(null); setSelectedDateInfo(null); };

  const handleDayCellMount = (arg) => {
    const dateStr = moment(arg.date).format('YYYY-MM-DD');
    const eventsOnDay = rawEvents.some(event => moment(event.start).isSame(dateStr, 'day'));
    
    if (eventsOnDay) {
        const dayNumberEl = arg.el.querySelector('.fc-daygrid-day-number');
        if (dayNumberEl) {
            dayNumberEl.style.border = `2px solid ${theme.palette.primary.main}`;
            dayNumberEl.style.borderRadius = '50%';
            dayNumberEl.style.width = '24px';
            dayNumberEl.style.height = '24px';
            dayNumberEl.style.display = 'flex';
            dayNumberEl.style.alignItems = 'center';
            dayNumberEl.style.justifyContent = 'center';
            dayNumberEl.style.lineHeight = '1';
            dayNumberEl.style.padding = '0';
        }
    }
  };

  const handleDialogSave = async (eventData) => {
    try {
      if (eventData.id) {
        await updatePresenzaTecnico(eventData);
        showNotification("Presenza modificata con successo!", "success");
      } else {
        await addPresenzaTecnico(eventData);
        showNotification("Presenza registrata con successo!", "success");
      }
    } catch (error) { showNotification("Errore durante il salvataggio.", "error");
    } finally { handleDialogClose(); loadData(); }
  };

  const handleEventDelete = async (eventId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa registrazione?")) return;
    try {
      await deletePresenzaTecnico(eventId);
      showNotification("Registrazione eliminata.", "success");
    } catch (error) {
      showNotification("Errore durante l'eliminazione.", "error");
    } finally { handleDialogClose(); loadData(); }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Registro Presenze Tecnici</Typography>
      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: 4, mb: 4 }}>
        <Box
          sx={{
            ".fc .fc-button-primary": { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, border: "none", borderRadius: theme.shape.borderRadius },
            ".fc .fc-button-primary:not(:disabled).fc-button-active": { backgroundColor: theme.palette.primary.dark },
            ".fc-toolbar-title": { color: theme.palette.text.primary, fontWeight: "bold" },
            '.fc-dayGridYear-view': {
              '.fc-scrollgrid, .fc-daygrid-month': { border: 'none' },
              '.fc-daygrid-month': { padding: '1em' },
              '.fc-daygrid-month-header': { textAlign: 'center', padding: '15px 0 5px 0', '& h2': { fontSize: '1em', fontWeight: '600' } },
              '.fc-col-header-cell-cushion': { fontSize: '0.8em', textDecoration: 'none' },
              '.fc-daygrid-day-number': { fontSize: '0.8em' },
              '.fc-day-other .fc-daygrid-day-number': { color: theme.palette.action.disabled },
              '.fc-daygrid-day-events': { display: 'none' },
              '.fc-day-today': { backgroundColor: 'transparent !important', '& .fc-daygrid-day-number': { color: theme.palette.primary.main, fontWeight: 'bold' } },
              '.fc-daygrid-months': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1em' },
            }
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            locale={itLocale}
            headerToolbar={{ left: "prev,next today", center: "title", right: "customYear,dayGridMonth,timeGridWeek" }}
            buttonText={{ today: "Oggi", month: "Mese", week: "Settimana", list: "Agenda", year: "Anno" }}
            initialView="dayGridMonth"
            events={calendarEvents}
            selectable={true}
            height="auto"
            dayHeaderFormat={{ weekday: 'narrow' }}
            fixedWeekCount={false}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            dayCellDidMount={handleDayCellMount}
            views={{
              customYear: {
                type: 'dayGrid',
                duration: { years: 1 },
                buttonText: 'Anno',
              }
            }}
          />
        </Box>
      </Paper>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Riepilogo</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup value={reportMode} exclusive onChange={(e, newMode) => { if (newMode !== null) setReportMode(newMode); }} size="small">
                    <ToggleButton value="Mensile">Mensile</ToggleButton>
                    <ToggleButton value="Annuale">Annuale</ToggleButton>
                </ToggleButtonGroup>
                {reportMode === 'Mensile' && (
                    <FormControl size="small" sx={{minWidth: 120}}>
                        <Select value={meseReport} onChange={(e) => setMeseReport(e.target.value)}>
                            {MESI.map(mese => <MenuItem key={mese.valore} value={mese.valore}>{mese.nome}</MenuItem>)}
                        </Select>
                    </FormControl>
                )}
                <FormControl size="small" sx={{minWidth: 120}}>
                    <Select value={annoReport} onChange={(e) => setAnnoReport(e.target.value)}>
                        {anniDisponibili.map(anno => <MenuItem key={anno} value={anno}>{anno}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
        </Box>
        <Paper sx={{ p: 2, borderRadius: 4 }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{fontWeight: 'bold'}}>Tecnico</TableCell>
                            <TableCell align="center" sx={{fontWeight: 'bold'}}>Giorni di Presenza</TableCell>
                            <TableCell align="center" sx={{fontWeight: 'bold'}}>Giorni di Assenza</TableCell>
                            <TableCell align="right" sx={{fontWeight: 'bold'}}>
                                {reportMode === 'Annuale' ? 'Totale Ore Annuali' : 'Totale Ore Mensili'}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((row) => (
                            <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">{row.nome}</TableCell>
                                <TableCell align="center">{row.presenze}</TableCell>
                                <TableCell align="center">{row.assenze}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                                    {row.oreTotali.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
      </Box>

      <RegistroTecnicoDialog open={dialogOpen} onClose={handleDialogClose} onSave={handleDialogSave} onDelete={handleEventDelete} event={selectedEvent} dateInfo={selectedDateInfo} tecnici={tecnici}/>
    </>
  );
}

export default RegistroTecniciPage;