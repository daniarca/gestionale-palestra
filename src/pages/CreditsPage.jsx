// File: src/pages/CreditsPage.jsx (AGGIORNATO)

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  IconButton, // Importa IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import packageJson from "../../package.json";
import SplitText from "../components/SplitText.jsx";
import TiltedCard from "../components/TiltedCard.jsx";

// Icone per i log e link
import BugReportIcon from "@mui/icons-material/BugReport";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import CodeIcon from "@mui/icons-material/Code";
import LanguageIcon from "@mui/icons-material/Language"; // Icona per il sito web

const updateLog = [
  {
    version: "0.9.22",
    date: "06/10/2025",
    changes: [
      {
        type: "FIX",
        text: "Risolto un errore critico nel form di nuova iscrizione che impediva il calcolo del codice fiscale e causava il crash dell'applicazione.",
      },
      {
        type: "IMPROVEMENT",
        text: "Aggiornata la libreria per il calcolo del codice fiscale (`codice-fiscale-utils`) alla sua versione più recente, migliorando l'affidabilità della funzione.",
      },
      {
        type: "IMPROVEMENT",
        text: "Migliorata la gestione dello stato nel form di creazione socio, allineandola a quella del form di modifica per maggiore coerenza e manutenibilità.",
      },
    ],
  },
  {
    version: "0.9.21",
    date: "11/10/2025",
    changes: [
      {
        type: "NEW",
        text: "Aggiunta la gestione dell'iscrizione al corso 'Calisthenics' per ogni socio.",
      },
      {
        type: "IMPROVEMENT",
        text: "Inserito un interruttore (toggle) nei moduli di creazione/modifica per l'iscrizione a Calisthenics.",
      },
      {
        type: "IMPROVEMENT",
        text: "Aggiunto un indicatore visivo (icona 'C') nella lista iscritti per identificare rapidamente i partecipanti al corso.",
      },
      {
        type: "FIX",
        text: "Risolto un bug che impediva il corretto salvataggio dello stato 'Calisthenics' durante la modifica di un socio.",
      },
    ],
  },
  {
    version: "0.9.20",
    date: "10/10/2025",
    changes: [
      {
        type: "NEW",
        text: "Implementato un sistema completo di promemoria per gli eventi in agenda, con notifiche e un'icona riepilogativa nella barra superiore.",
      },
      {
        type: "IMPROVEMENT",
        text: "Le notifiche dei promemoria ora appaiono come un dialogo modale al centro dello schermo per una maggiore visibilità e interazione.",
      },
      {
        type: "IMPROVEMENT",
        text: "Aggiunta un'icona 'sveglia' nella barra superiore che mostra un contatore e un elenco dei promemoria attivi per i prossimi 7 giorni.",
      },
    ],
  },
  {
    version: "0.9.19",
    date: "05/10/2025",
    changes: [
      {
        type: "IMPROVEMENT",
        text: "Ridisegnata completamente la sezione 'Riepilogo Finanziario' della Dashboard per una maggiore chiarezza, separando nettamente i dati Annuali e Mensili in due riquadri distinti (prima riga).",
      },
      {
        type: "IMPROVEMENT",
        text: "Riorganizzato il layout principale della Dashboard spostando 'Attività Giornaliere', 'Scadenze' e 'Ultimi Pagamenti' sulla stessa riga (3 colonne).",
      },
    ],
  },
  {
    version: "0.9.18",
    date: "05/10/2025",
    changes: [
      {
        type: "NEW",
        text: "Aggiunta la Paga Oraria per i tecnici e calcolo automatico del costo mensile/annuale nel 'Registro Presenze Tecnici'.",
      },
      {
        type: "IMPROVEMENT",
        text: "Ridisegnata l'interfaccia del riepilogo del Registro Tecnici per garantire un layout stabile (anti-shift) e pulito.",
      },
      {
        type: "FIX",
        text: "Risolto il problema del fastidioso bordo di focus (outline) sui pulsanti e sui ToggleButton in tutta l'applicazione.",
      },
    ],
  },
  {
    version: "0.9.17",
    date: "04/10/2025",
    changes: [
      {
        type: "NEW",
        text: "Aggiunta la funzionalità 'Registro Presenze Tecnici' con un calendario dedicato per tracciare ore, presenze e assenze.",
      },
      {
        type: "IMPROVEMENT",
        text: "Rinnovata la pagina 'Crediti e Aggiornamenti' con un design a timeline, animazioni e una card sviluppatore interattiva.",
      },
      {
        type: "FIX",
        text: "Risolto un bug di routing che impediva l'accesso alla pagina 'Registro Tecnici'.",
      },
    ],
  },
  {
    version: "0.9.16",
    date: "04/10/2025",
    changes: [
      {
        type: "FIX",
        text: "Risolto un bug nella vista a lista della pagina 'Iscritti' dove il click sulla checkbox apriva i dettagli dell'atleta invece di selezionarlo.",
      },
      {
        type: "FIX",
        text: "Corretto un errore critico all'avvio dell'app che impediva il caricamento dei dati (`Cannot access 'allIscrittiSnap'`).",
      },
      {
        type: "FIX",
        text: "La sezione 'Ultimi Pagamenti' nella Dashboard ora gestisce e filtra correttamente le transazioni con date future.",
      },
      {
        type: "IMPROVEMENT",
        text: "Migliorata l'interfaccia della barra superiore per un design più pulito.",
      },
    ],
  },
  {
    version: "0.9.15",
    date: "03/10/2025",
    changes: [
      {
        type: "FIX",
        text: "Corretto un bug che impediva l'aggiornamento in tempo reale dei pagamenti nella Dashboard e nei Report.",
      },
      {
        type: "FIX",
        text: "Risolto un problema di visualizzazione nello storico pagamenti che non sommava correttamente gli acconti della quota iscrizione.",
      },
      {
        type: "IMPROVEMENT",
        text: "Migliorata la robustezza dei form per garantire che le quote vengano sempre salvate come valori numerici.",
      },
      { type: "NEW", text: "Aggiunta la pagina 'Crediti e Aggiornamenti'." },
    ],
  },
  {
    version: "0.9.12",
    date: "Data Precedente",
    changes: [{ type: "NEW", text: "Versione iniziale del gestionale." }],
  },
];

const ChangeChip = ({ type }) => {
  const config = {
    NEW: {
      label: "Novità",
      color: "success",
      icon: <NewReleasesIcon sx={{ fontSize: "1rem", mr: 0.5 }} />,
    },
    IMPROVEMENT: {
      label: "Miglioramento",
      color: "info",
      icon: <AutorenewIcon sx={{ fontSize: "1rem", mr: 0.5 }} />,
    },
    FIX: {
      label: "Correzione",
      color: "error",
      icon: <BugReportIcon sx={{ fontSize: "1rem", mr: 0.5 }} />,
    },
  };
  const { label, color, icon } = config[type] || {
    label: type,
    color: "default",
    icon: null,
  };
  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size="small"
      sx={{ mr: 2, fontWeight: "bold" }}
    />
  );
};

function CreditsPage() {
  return (
    <Box>
      <SplitText
        text="Crediti e Aggiornamenti"
        className="h4-split"
        delay={20}
        duration={0.5}
      />

      <style>{`.h4-split { font-family: "Poppins", sans-serif; font-size: 2.125rem; font-weight: bold; margin-bottom: 24px; }`}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TiltedCard>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }}>
              <CodeIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Sviluppatore
              </Typography>
              <Typography variant="h6" color="primary">
                Daniele Arcangeli
              </Typography>
              <Typography color="text.secondary">
                Versione Attuale: {packageJson.version}
              </Typography>
            </Box>
            {/* --- INIZIO MODIFICA --- */}
            <IconButton
              href="https://www.arcangeli.one"
              target="_blank"
              sx={{ ml: "auto" }}
              title="Visita il sito web"
            >
              <LanguageIcon />
            </IconButton>
            {/* --- FINE MODIFICA --- */}
          </Paper>
        </TiltedCard>
      </motion.div>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold", mt: 6, mb: 3 }}
      >
        Log Aggiornamenti
      </Typography>

      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            left: "19px",
            top: 0,
            bottom: 0,
            width: "2px",
            bgcolor: "divider",
            zIndex: 0,
          }}
        />

        {updateLog.map((log, index) => (
          <motion.div
            key={log.version}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* --- INIZIO MODIFICA --- */}
            <TiltedCard>
              {/* --- FINE MODIFICA --- */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 3,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      border: "2px solid",
                      borderColor: "background.paper",
                      zIndex: 1,
                    }}
                  />
                </Box>

                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 4,
                    flexGrow: 1,
                    ml: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Versione {log.version}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.date}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <List dense sx={{ p: 0 }}>
                    {log.changes.map((change, idx) => (
                      <ListItem
                        key={idx}
                        disableGutters
                        sx={{ alignItems: "flex-start", mb: 1 }}
                      >
                        <Box sx={{ mt: "4px" }}>
                          <ChangeChip type={change.type} />
                        </Box>
                        <ListItemText primary={change.text} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
              {/* --- INIZIO MODIFICA --- */}
            </TiltedCard>
            {/* --- FINE MODIFICA --- */}
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

export default CreditsPage;
