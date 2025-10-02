// File: src/pages/TecniciPage.jsx

import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useNotification } from "../context/NotificationContext.jsx";
import {
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { fetchTecnici, addTecnico } from "../services/firebaseService.js";
import TecnicoEditDialog from "../components/TecnicoEditDialog.jsx";

function TecniciPage() {
  const [tecnici, setTecnici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { showNotification } = useNotification();

  const loadTecnici = async () => {
    setLoading(true);
    try {
      const data = await fetchTecnici();
      setTecnici(data);
    } catch (error) {
      console.error("Errore caricamento tecnici:", error);
      showNotification("Errore nel caricamento dei tecnici.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTecnici();
  }, []);

  const handleSaveTecnico = async (tecnicoData) => {
    try {
      if (!tecnicoData.nome || !tecnicoData.cognome) {
        showNotification("Nome e Cognome sono obbligatori.", "error");
        return;
      }
      await addTecnico(tecnicoData);
      showNotification("Nuovo tecnico aggiunto!", "success");
      setDialogOpen(false);
      loadTecnici();
    } catch (error) {
      showNotification("Errore durante il salvataggio.", "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h2" sx={{ fontWeight: "bold" }}>
            Gestione Tecnici
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Aggiungi Tecnico
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <List>
          {tecnici.map((tecnico, index) => (
            <React.Fragment key={tecnico.id}>
              <ListItemButton
                component={RouterLink}
                to={`/tecnici/${tecnico.id}`}
              >
                <ListItemText
                  primary={`${tecnico.cognome || "(Cognome mancante)"} ${
                    tecnico.nome || "(Nome mancante)"
                  }`}
                  secondary={tecnico.ruolo || "N/D"}
                  primaryTypographyProps={{ fontWeight: "bold" }}
                />
              </ListItemButton>
              {index < tecnici.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <TecnicoEditDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveTecnico}
      />
    </Box>
  );
}

export default TecniciPage;
