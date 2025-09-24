// File: src/pages/DocumentazionePage.jsx (Nuovo File)

import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const guide = [
  {
    title: "Come aggiungere un nuovo socio?",
    content: "Vai alla pagina 'Iscritti' dal menu laterale. Clicca il pulsante 'Apri Form Iscrizione' in alto a destra. Compila tutti i campi richiesti e clicca 'Salva Iscrizione'. Il nuovo socio apparirà immediatamente nella lista."
  },
  {
    title: "Come gestire i pagamenti di un socio?",
    content: "Dalla pagina 'Iscritti', clicca sulla scheda del socio per aprire la sua pagina di dettaglio. Vai al tab 'Pagamenti' e clicca 'Aggiungi Pagamento'. Potrai registrare una quota mensile, annuale o di iscrizione."
  },
  {
    title: "Come funzionano i filtri delle notifiche?",
    content: "Clicca l'icona a forma di campanella in alto a destra. Apparirà un menu con dei riepiloghi (es. 'Abbonamenti Scaduti'). Cliccando su uno di questi riepiloghi, verrai portato alla pagina 'Iscritti' e vedrai la lista già filtrata con solo le persone relative a quell'avviso."
  },
  {
    title: "Come si crea un gruppo e si assegnano i membri?",
    content: "Vai alla pagina 'Gruppi'. Usa il form in alto per creare un nuovo gruppo, assegnando un nome e un allenatore. Una volta creato, il gruppo apparirà nella lista. Clicca su 'Gestisci Membri' per aprire un pop-up dove potrai spostare gli atleti dalla lista di sinistra (non nel gruppo) a quella di destra (nel gruppo)."
  },
  {
    title: "Come si archivia e si ripristina un socio?",
    content: "Apri la scheda di dettaglio di un socio e clicca il pulsante 'Archivia'. L'iscritto sparirà dalla lista principale. Per vederlo o ripristinarlo, vai alla pagina 'Archivio' dal menu laterale."
  }
];

function DocumentazionePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Guida all'Uso del Gestionale
      </Typography>
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        {guide.map((item, index) => (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{item.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {item.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
}

export default DocumentazionePage;