import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query } from "firebase/firestore"; 
import { db } from '../firebase.js';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Paper, useTheme } from '@mui/material';

function CalendarioPage() {
  const [gruppi, setGruppi] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchGruppi = async () => {
      const q = query(collection(db, "gruppi"));
      const querySnapshot = await getDocs(q);
      setGruppi(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchGruppi();
  }, []);

  const events = useMemo(() => {
    return gruppi
      .filter(g => g.giornoSettimana != null && g.oraInizio && g.oraFine)
      .map(g => ({
        title: `${g.nome} (${g.staffNome})`,
        daysOfWeek: [g.giornoSettimana],
        startTime: g.oraInizio,
        endTime: g.oraFine,
        color: g.sede === 'Frascati' ? theme.palette.primary.main : theme.palette.info.main,
        extendedProps: { gruppoId: g.id, descrizione: g.descrizione }
      }));
  }, [gruppi, theme]);

  return (
    <Paper sx={{ p: {xs: 1, sm: 2, md: 3}, borderRadius: 4 }}>
      <Box sx={{ '.fc-header-toolbar': { flexDirection: { xs: 'column', md: 'row' } }, '.fc-event': { fontSize: '0.9rem' } }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          events={events}
          locale='it'
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          height="auto"
          weekends={true}
        />
      </Box>
    </Paper>
  );
}
export default CalendarioPage;