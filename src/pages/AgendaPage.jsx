// File: src/pages/AgendaPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Paper, useTheme } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it"; // <-- 1. IMPORTA LA LINGUA ITALIANA
import { useNotification } from "../context/NotificationContext.jsx";
import EventEditDialog from "../components/EventEditDialog.jsx";
import {
  fetchAgendaEvents,
  addAgendaEvent,
  updateAgendaEvent,
  deleteAgendaEvent,
  checkAndNotifyReminders,
} from "../services/firebaseService.js";

function AgendaPage() {
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const { showNotification, showReminder } = useNotification();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const loadEvents = useCallback(async () => {
    try {
      const fetchedEvents = await fetchAgendaEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Errore caricamento eventi:", error);
      showNotification("Errore nel caricamento degli eventi.", "error");
    }
  }, [showNotification]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Effetto per controllare i promemoria UNA SOLA VOLTA al caricamento della pagina
  useEffect(() => {
    // Usiamo un timeout per assicurarci che il caricamento iniziale sia completo
    const timer = setTimeout(() => checkAndNotifyReminders(showReminder, navigate), 1000);
    return () => clearTimeout(timer); // Pulizia del timer
  }, [showReminder, navigate]); // Eseguito solo una volta

  // Effetto per gestire l'apertura di un evento da URL (es. da notifica)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get("eventId");
    if (eventId && events.length > 0) {
      const eventToOpen = events.find(e => e.id === eventId);
      if (eventToOpen) {
        handleEventClick({ event: { ...eventToOpen, ...eventToOpen.extendedProps, id: eventToOpen.id, startStr: eventToOpen.start, endStr: eventToOpen.end } });
        // Rimuovi il parametro dall'URL per non riaprirlo al refresh
        navigate('/agenda', { replace: true });
      }
    }
  }, [location.search, events, navigate]);

  const handleDateSelect = (selectInfo) => {
    setSelectedDateInfo(selectInfo);
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const props = clickInfo.event.extendedProps || clickInfo.event;
    const eventData = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay,
      color: clickInfo.event.backgroundColor || props.color,
      description: props.description || "",
      reminderDate: props.reminderDate || null,
    };
    setSelectedEvent(eventData);
    setSelectedDateInfo(null);
    setDialogOpen(true);
  };

  const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo;
    const updatedEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      color: event.backgroundColor,
      description: event.extendedProps.description || "",
      // Manteniamo i dati del promemoria durante il drag & drop
      reminderDate: event.extendedProps.reminderDate || null,
    };
    try {
      await updateAgendaEvent(updatedEvent);
      showNotification("Evento spostato con successo!", "success");
      loadEvents();
    } catch (error) {
      console.error("Errore spostamento evento:", error);
      showNotification("Errore durante l'aggiornamento dell'evento.", "error");
      dropInfo.revert();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    setSelectedDateInfo(null);
  };

  const handleDialogSave = async (eventData) => {
    try {
      if (eventData.id) {
        await updateAgendaEvent(eventData);
        showNotification("Evento modificato con successo!", "success");
      } else {
        await addAgendaEvent(eventData);
        showNotification("Evento creato con successo!", "success");
      }
    } catch (error) {
      console.error("Errore salvataggio:", error);
      showNotification("Errore durante il salvataggio dell'evento.", "error");
    } finally {
      handleDialogClose();
      loadEvents();
    }
  };

  const handleEventDelete = async (eventId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo evento?")) return;
    try {
      await deleteAgendaEvent(eventId);
      showNotification("Evento eliminato.", "success");
    } catch (error) {
      showNotification("Errore during l'eliminazione.", "error");
    } finally {
      handleDialogClose();
      loadEvents();
    }
  };

  return (
    <>
      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: 4 }}>
        {/* 2. BOX CONTENITORE PER APPLICARE STILI AL CALENDARIO */}
        <Box
          sx={{
            ".fc .fc-button-primary": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              border: "none",
              borderRadius: theme.shape.borderRadius,
              textTransform: "none",
              fontWeight: "bold",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
              "&:focus": {
                boxShadow: "none",
              },
            },
            ".fc .fc-button-primary:not(:disabled).fc-button-active": {
              backgroundColor: theme.palette.primary.dark,
            },
            ".fc .fc-button": {
              textTransform: "none",
              fontWeight: "bold",
            },
            ".fc-toolbar-title": {
              color: theme.palette.text.primary,
              fontWeight: "bold",
            },
            ".fc-col-header-cell-cushion, .fc-daygrid-day-number": {
              color: theme.palette.text.secondary,
              textDecoration: "none",
            },
          }}
        >
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            locale={itLocale} // <-- 3. APPLICA LA LINGUA ITALIANA
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek",
            }}
            initialView="dayGridMonth"
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            height="auto"
            buttonText={{
              // Assicura che i nomi siano corretti se la locale non basta
              today: "Oggi",
              month: "Mese",
              week: "Settimana",
              list: "Agenda",
            }}
          />
        </Box>
      </Paper>

      <EventEditDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        onDelete={handleEventDelete}
        event={selectedEvent}
        dateInfo={selectedDateInfo}
      />
    </>
  );
}

export default AgendaPage;
