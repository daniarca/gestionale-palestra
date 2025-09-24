// File: src/pages/DocumentazionePage.jsx

import React from 'react';
import { Box, Typography, Paper, Grid, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Groups';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningIcon from '@mui/icons-material/Warning';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArchiveIcon from '@mui/icons-material/Archive';

// Dati che mappano le funzionalità alle icone e alle descrizioni
const guideItems = [
  { 
    title: 'Anagrafica Soci e Stato', 
    description: 'Gestisce l\'elenco completo degli iscritti attivi. Puoi aggiungere, modificare o archiviare un socio. Lo stato "attivo" o "archiviato" è fondamentale per il caricamento dati (fetchData).', 
    icon: <PeopleIcon color="primary" />,
    files: ['IscrittiPage.jsx', 'SchedaSocioPage.jsx', 'firebaseService.js']
  },
  { 
    title: 'Scadenze e Notifiche Automatiche', 
    description: 'Il sistema monitora automaticamente gli abbonamenti e i certificati medici. Le notifiche (in alto a destra) e la Dashboard segnalano scadenze imminenti (entro 30 giorni) o scadute.', 
    icon: <WarningIcon color="warning" />,
    files: ['App.jsx', 'DashboardPage.jsx', 'IscrittiLista.jsx']
  },
  { 
    title: 'Registrazione Pagamenti', 
    description: 'Quando si registra un pagamento (mensile o annuale), il sistema aggiorna automaticamente la data di scadenza dell\'abbonamento del socio (abbonamento.scadenza) in base alla logica implementata.', 
    icon: <PaymentIcon color="success" />,
    files: ['SchedaSocioPage.jsx (handleAggiungiPagamento)', 'AggiungiPagamentoDialog.jsx']
  },
  { 
    title: 'Gestione Gruppi e Orario', 
    description: 'Crea e modifica i gruppi, associando gli atleti e un allenatore. La pagina Orario visualizza l\'orario settimanale basato sui giorni e orari assegnati ai gruppi.', 
    icon: <GroupIcon color="info" />,
    files: ['GruppiPage.jsx', 'OrarioPage.jsx', 'GestisciMembriDialog.jsx']
  },
  { 
    title: 'Stampa Ricevuta (Fiscale)', 
    description: 'Genera una ricevuta in formato A4 che riepiloga il totale pagato per l\'anno sportivo in corso. L\'importo viene convertito in lettere per validità contabile.', 
    icon: <PrintIcon color="secondary" />,
    files: ['SchedaSocioPage.jsx', 'generateReceipt.js', 'numberToWords.js']
  },
  { 
    title: 'Archiviazione Dati', 
    description: 'La pagina Archivio gestisce tutti i soci con stato "archiviato". È possibile ripristinarli da questa pagina per riportarli in Anagrafica Attiva.', 
    icon: <ArchiveIcon color="default" />,
    files: ['ArchivioPage.jsx', 'firebaseService.js']
  },
  { 
    title: 'Gestione Documentale', 
    description: 'Permette il caricamento, la visualizzazione e l\'eliminazione di documenti associati al socio (es. Certificati) direttamente su Firebase Storage.', 
    icon: <DescriptionIcon color="error" />,
    files: ['SchedaSocioPage.jsx', 'firebaseService.js (uploadFile, deleteFile)']
  },
];

function DocumentazionePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Guida al Gestionale (Documentazione Funzionale)</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Questa pagina riepiloga le funzionalità principali del sistema e i moduli che le implementano.
      </Typography>
      
      <Grid container spacing={4}>
        {guideItems.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, color: item.icon.props.color }}>
                  {React.cloneElement(item.icon, { fontSize: 'large' })}
                </ListItemIcon>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>{item.title}</Typography>
              </Box>
              <Typography variant="body1" sx={{ flexGrow: 1, mb: 2 }}>{item.description}</Typography>
              
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>File Principali:</Typography>
              <List dense disablePadding>
                {item.files.map((file, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0 }}>
                    <ListItemText primary={<Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{file}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Struttura del Progetto</Typography>
          <Typography variant="body2">Il codice è organizzato in: <code style={{ backgroundColor: '#2E3440', padding: '2px 4px', borderRadius: '4px' }}>src/pages/</code> (pagine intere), <code style={{ backgroundColor: '#2E3440', padding: '2px 4px', borderRadius: '4px' }}>src/components/</code> (elementi riutilizzabili), <code style={{ backgroundColor: '#2E3440', padding: '2px 4px', borderRadius: '4px' }}>src/context/</code> (stato globale) e <code style={{ backgroundColor: '#2E3440', padding: '2px 4px', borderRadius: '4px' }}>src/services/</code> (interazione con Firebase).</Typography>
      </Box>
    </Box>
  );
}

export default DocumentazionePage;