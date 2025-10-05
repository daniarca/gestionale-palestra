// File: src/pages/RegistroTecniciPage.jsx (AGGIORNATO)

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Box, Paper, useTheme, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, FormControl, Select, MenuItem,
  ToggleButton, ToggleButtonGroup, Stack // Importo Stack
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
  
  // LOGICA AGGIORNATA PER IL REPORT E CALCOLO DEL COSTO
  const reportData = useMemo(() => {
    const tecniciMap = tecnici.reduce((acc, tecnico) => {
        acc[tecnico.id] = {
            id: tecnico.id, 
            nome: `${tecnico.cognome} ${tecnico.nome}`,
            presenze: 0, 
            assenze: 0, 
            oreTotali: 0,
            pagaOraria: parseFloat(tecnico.pagaOraria) || 0, // Usa la paga oraria
        };
        return acc;
    }, {});

    rawEvents.forEach(event => {
      const eventDate = moment(event.start);
      const isCorrectYear = eventDate.year() === annoReport;
      const isCorrectMonth = eventDate.month() === meseReport;

      if (isCorrectYear && (reportMode === 'Annuale' || isCorrectMonth)) {
        const statTecnico = tecniciMap[event.tecnicoId];
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

    // Calcolo del costo totale
    return Object.values(tecniciMap).map(stat => ({
        ...stat,
        // CALCOLO DEL COSTO: Ore Totali * Paga Oraria
        costoTotale: stat.oreTotali * stat.pagaOraria,
    }));

  }, [rawEvents, tecnici, annoReport, meseReport, reportMode]);

  const handleDateClick = (arg) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && calendarApi.view.type === 'customYear') {
      // Cliccando su un giorno nella vista annuale, naviga al mese corrispondente
      calendarApi.changeView('dayGridMonth', arg.date);
    } else {
      setSelectedDateInfo(arg);
      setSelectedEvent(null);
      setDialogOpen(true);
    }
  };
  
  // LOGICA AGGIUNTA: Rendi il titolo del mese cliccabile nella vista annuale
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    const addClickListenerToMonthHeaders = () => {
        // FullCalendar wraps the month title in 'a.fc-daygrid-month-header' in multi-month/year view
        const monthHeaders = calendarApi.el.querySelectorAll('.fc-daygrid-month-header');
        
        // La logica viene eseguita solo se si è nella vista customYear
        if (calendarApi.view.type !== 'customYear' && monthHeaders.length === 0) return;
        
        monthHeaders.forEach(header => {
            // Impedisce di attaccare i listener più volte
            if (!header.dataset.hasMonthClickListener) {
                // Il testo del titolo è nel formato "Mese Anno"
                const titleText = header.textContent.trim();
                const monthDate = moment(titleText, 'MMMM YYYY', 'it');
                
                if (monthDate.isValid()) {
                    const handleClick = (e) => {
                        e.preventDefault(); 
                        calendarApi.changeView('dayGridMonth', monthDate.toDate());
                    };
                    
                    header.addEventListener('click', handleClick);
                    header.style.cursor = 'pointer';
                    header.dataset.hasMonthClickListener = 'true'; // Mark for cleanup
                }
            }
        });
    };

    // Callback per FullCalendar quando la vista è montata
    const viewMountHandler = ({ view }) => {
        if (view.type === 'customYear') {
            // Necessario un leggero ritardo per assicurare che gli elementi DOM di tutti i mesi siano disponibili
            setTimeout(addClickListenerToMonthHeaders, 0); 
        }
    };

    // Imposta l'opzione viewDidMount sul calendario
    calendarApi.setOption('viewDidMount', viewMountHandler);
    
    // Tentativo di attach iniziale in caso la vista sia già customYear al mount
    if (calendarApi.view.type === 'customYear') {
        setTimeout(addClickListenerToMonthHeaders, 0);
    }

  }, [calendarRef.current]);
  
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
            
            // STILI PER OTTENERE LA VISTA ANNUALE COMPATTA E A MATRICE
            '.fc-customYear-view': {
              '.fc-scrollgrid, .fc-daygrid-month': { border: 'none', overflow: 'hidden' },
              
              // Griglia Responsiva (mattonelle 4x3)
              '.fc-daygrid-months': { 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1em', 
              },
              '.fc-daygrid-month': { 
                padding: '0.5em', 
                border: '1px solid', 
                borderColor: theme.palette.divider, 
                borderRadius: '8px', 
                marginBottom: '0 !important',
                // Compattezza del mese
                '& table': { height: '100%', width: '100%' },
              },
              // Header del mese (Mese Anno)
              '.fc-daygrid-month-header': { 
                  textAlign: 'center', 
                  padding: '5px 0', 
                  backgroundColor: theme.palette.action.hover + '40', // Sfondo leggero per il titolo
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '& h2': { 
                      fontSize: '1em', 
                      fontWeight: '700',
                      color: theme.palette.text.primary, 
                  } 
              },
              // Intestazioni giorni (L, M, M, G, V, S, D)
              '.fc-col-header-cell-cushion': { 
                  fontSize: '0.75em', 
                  textDecoration: 'none',
                  padding: '2px 0',
                  color: theme.palette.text.secondary 
              },
              // Numero giorno
              '.fc-daygrid-day-number': { 
                  fontSize: '0.75em', 
                  padding: '0.2em 0.3em',
                  color: theme.palette.text.primary
              },
              '.fc-day-other .fc-daygrid-day-number': { color: theme.palette.action.disabled },
              '.fc-daygrid-day-events': { display: 'none' }, // Nasconde gli eventi per mantenere pulito
              '.fc-day-today': { 
                  backgroundColor: 'transparent !important', 
                  '& .fc-daygrid-day-number': { 
                      color: theme.palette.primary.main, 
                      fontWeight: 'bold',
                      backgroundColor: theme.palette.primary.main + '20', 
                      borderRadius: '50%'
                  } 
              },
            }
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            locale={itLocale}
            headerToolbar={{ left: "prev,next today", center: "title", right: "customYear,dayGridMonth,timeGridWeek" }}
            buttonText={{ today: "Oggi", month: "Mese", week: "Settimana", list: "Agenda", customYear: "Anno" }}
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
            {/* MODIFICHE UI: Stack per mantenere l'allineamento e usare Box per il layout fisso */}
            <Stack direction="row" spacing={2} alignItems="center">
                
                {/* 1. Toggle Button con color="primary" */}
                <ToggleButtonGroup 
                    value={reportMode} 
                    exclusive 
                    onChange={(e, newMode) => { if (newMode !== null) setReportMode(newMode); }} 
                    size="small"
                    color="primary" // FISSA IL COLORE
                >
                    <ToggleButton value="Mensile">Mensile</ToggleButton>
                    <ToggleButton value="Annuale">Annuale</ToggleButton>
                </ToggleButtonGroup>
                
                {/* 2. Box a larghezza fissa per il selettore del Mese */}
                <Box 
                    sx={{ 
                        minWidth: 120, 
                        // Fissa l'altezza per evitare che lo Stack collassi
                        height: 40, 
                        // Usa visibility: hidden per nascondere l'elemento 
                        // ma mantenerne lo spazio riservato.
                        visibility: reportMode === 'Mensile' ? 'visible' : 'hidden' 
                    }}
                >
                    {/* Renderizza il FormControl sempre, il Box lo nasconde se non serve */}
                    <FormControl fullWidth size="small">
                        <Select 
                            value={meseReport} 
                            onChange={(e) => setMeseReport(e.target.value)}
                        >
                            {MESI.map(mese => <MenuItem key={mese.valore} value={mese.valore}>{mese.nome}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
                
                {/* Selettore Anno */}
                <FormControl size="small" sx={{minWidth: 120}}>
                    <Select value={annoReport} onChange={(e) => setAnnoReport(e.target.value)}>
                        {anniDisponibili.map(anno => <MenuItem key={anno} value={anno}>{anno}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>
            {/* FINE MODIFICHE UI */}
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
                            <TableCell align="right" sx={{fontWeight: 'bold', color: theme.palette.error.main}}>
                                {reportMode === 'Annuale' ? 'Costo Annuale (€)' : 'Costo Mensile (€)'}
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
                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1em', color: theme.palette.error.main }}>
                                    {row.costoTotale.toFixed(2)}
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