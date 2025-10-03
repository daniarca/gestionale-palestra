// File: src/pages/DocumentazionePage.jsx (Aggiornato)

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const guide = [
  {
    title: "Come aggiungere un nuovo socio?",
    content:
      "Dalla barra laterale, vai alla pagina 'Iscritti'. Clicca sul pulsante 'Aggiungi Socio' in alto a destra per aprire il modulo di iscrizione. Compila i campi richiesti, inclusi i nuovi dati come i 'Codici Tesseramento', e clicca su 'Salva Iscrizione'. Il nuovo socio apparirà immediatamente nella lista.",
  },
  {
    title: "Come gestire i pagamenti di un socio?",
    content:
      "Dalla pagina 'Iscritti', clicca sulla scheda del socio desiderato per accedere alla sua pagina di dettaglio. Seleziona il tab 'Pagamenti' e clicca su 'Aggiungi Pagamento'. Nel pop-up, potrai specificare l'importo, il tipo di pagamento (Quota Mensile o Quota Iscrizione) e il metodo (Contanti o Bonifico). Il sistema calcolerà automaticamente la nuova scadenza dell'abbonamento o sommerà l'importo alla quota di iscrizione totale.",
  },
  {
    title: "Come funzionano le notifiche e i filtri rapidi?",
    content:
      "L'icona a forma di campanella in alto a destra mostra il numero totale di scadenze critiche. Cliccandola, vedrai un elenco di avvisi (es. 'Abbonamenti Scaduti', 'Certificati in Scadenza'). Selezionando un avviso, verrai reindirizzato alla pagina 'Iscritti' con la lista già filtrata per mostrarti solo i soci pertinenti a quella notifica.",
  },
  {
    title: "Come si gestiscono i Tecnici?",
    content:
      "Vai alla sezione 'Tecnici' dal menu. Qui puoi aggiungere un nuovo tecnico con tutti i suoi dati anagrafici e di contatto. Cliccando su un tecnico esistente, puoi accedere alla sua scheda personale per modificare i dati o caricare documenti specifici (es. contratto, certificazioni).",
  },
  {
    title: "Come funzionano i Gruppi e l'Orario?",
    content:
      "Nella pagina 'Gruppi' puoi creare un nuovo corso, assegnando un nome, un allenatore e un orario settimanale. Una volta creato, clicca su 'Membri' per aggiungere gli atleti al gruppo. L'orario creato sarà visibile automaticamente nella pagina 'Orario', che offre una visione d'insieme di tutte le lezioni della settimana.",
  },
  {
    title: "Come si utilizza il Report Finanziario?",
    content:
      "La pagina 'Report Finanziario' offre una panoramica completa degli incassi. Puoi filtrare i dati per anno sportivo. La sezione 'Panoramica' mostra grafici sugli incassi mensili e sulla divisione per tipo di pagamento. La sezione 'Elenco Transazioni' ti permette di vedere, cercare ed esportare in Excel tutte le transazioni di un anno. Il pulsante 'Export Bonifico (Matrice)' genera un file Excel specifico che riporta solo i pagamenti effettuati tramite bonifico, utile per la contabilità.",
  },
  {
    title: "Come si archiviano e si eliminano i soci?",
    content:
      "Per rimuovere un socio dalla lista attiva senza eliminarlo, apri la sua scheda e clicca su 'Archivia'. L'iscritto verrà spostato nella sezione 'Archivio', da cui potrà essere ripristinato in qualsiasi momento. Il pulsante 'Elimina', invece, rimuove permanentemente e in modo irreversibile tutti i dati del socio dal database.",
  },
];

function DocumentazionePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Guida all'Uso del Gestionale
      </Typography>
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        {guide.map((item, index) => (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{item.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{item.content}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
}

export default DocumentazionePage;
