// File: src/pages/CreditsPage.jsx (Nuovo File)

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
  useTheme,
} from "@mui/material";
import packageJson from "../../package.json"; // Importa il package.json per la versione

// Qui puoi tenere traccia degli aggiornamenti. Aggiungi un nuovo oggetto in cima per ogni nuova versione.
const updateLog = [
  {
    version: "0.9.15",
    date: "03/10/2025",
    changes: [
      {
        type: "FIX",
        text: "Corretto un bug critico che impediva l'aggiornamento in tempo reale dei pagamenti nella Dashboard e nei Report.",
      },
      {
        type: "FIX",
        text: "Risolto un problema di visualizzazione nello storico pagamenti che non sommava correttamente gli acconti della quota iscrizione.",
      },
      {
        type: "IMPROVEMENT",
        text: "Migliorata la robustezza dei form per garantire che le quote vengano sempre salvate come valori numerici.",
      },
      {
        type: "IMPROVEMENT",
        text: "La lista 'Ultimi Pagamenti' nella dashboard ora esclude transazioni con date future e gestisce correttamente i pagamenti senza un 'tipo' specificato.",
      },
      { type: "NEW", text: "Aggiunta la pagina 'Crediti e Aggiornamenti'." },
    ],
  },
  {
    version: "0.9.12",
    date: "Data Precedente",
    changes: [{ type: "NEW", text: "Versione iniziale del log." }],
  },
  // Aggiungi qui le versioni future...
];

const ChangeChip = ({ type }) => {
  const colors = {
    NEW: { label: "Novità", color: "success" },
    IMPROVEMENT: { label: "Miglioramento", color: "info" },
    FIX: { label: "Correzione", color: "error" },
  };
  const { label, color } = colors[type] || { label: type, color: "default" };
  return (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{ mr: 2, fontWeight: "bold" }}
    />
  );
};

function CreditsPage() {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Crediti e Aggiornamenti
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          Sviluppatore
        </Typography>
        <Typography variant="h6" color="primary">
          Daniele Arcangeli
        </Typography>
        <Typography color="text.secondary">
          Versione Attuale del Gestionale: {packageJson.version}
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mt: 4 }}>
        Log Aggiornamenti
      </Typography>

      {updateLog.map((log, index) => (
        <Paper
          key={log.version}
          sx={{ p: { xs: 2, md: 3 }, mb: 2, borderRadius: 4 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
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
          <List dense>
            {log.changes.map((change, idx) => (
              <ListItem key={idx} disableGutters>
                <ChangeChip type={change.type} />
                <ListItemText primary={change.text} />
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
}

export default CreditsPage;
