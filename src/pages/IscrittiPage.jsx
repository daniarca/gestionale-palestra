// File: src/pages/IscrittiPage.jsx

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import IscrittoForm from "../components/IscrittoForm.jsx"; // Il nuovo Dialog
import IscrittiLista from "../components/IscrittiLista.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { exportToExcel } from "../utils/exportToExcel.js";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import moment from "moment";

// Constants per il calcolo della posizione (drawerWidth da Layout.jsx)
const DRAWER_WIDTH = 280;

function IscrittiPage({ iscrittiList, onDataUpdate, onIscrittoAdded }) {
  const [isFormOpen, setIsFormOpen] = useState(false); // Ora gestisce l'apertura del Dialog
  const [activeFilter, setActiveFilter] = useState("tutti");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const showNotification = useNotification();
  const theme = useTheme();

  const handleToggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // onIscrittoAdded viene chiamato dal form dopo il salvataggio
  const handleIscrittoAdded = (nuovoIscrittoConId) => {
    // La chiusura del Dialog è gestita da IscrittoForm.jsx
    onIscrittoAdded(nuovoIscrittoConId);
  };

  const handleSelectIscritto = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((i) => i !== id)
        : [...prevSelected, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      showNotification("Seleziona almeno un socio da esportare.", "warning");
      return;
    }
    const selectedIscritti = iscrittiList.filter((i) =>
      selectedIds.includes(i.id)
    );
    exportToExcel(selectedIscritti, "Lista_Atleti_Gara");
    showNotification(
      `Esportati ${selectedIds.length} soci in Lista_Atleti_Gara.xlsx`,
      "success"
    );
    setSelectedIds([]);
  };

  const today = moment();
  const filteredIscritti = useMemo(() => {
    let filtered = iscrittiList;

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.nome.toLowerCase().includes(lowercasedSearchTerm) ||
          i.cognome.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    switch (activeFilter) {
      case "abbonamenti_scaduti":
        return filtered.filter((i) => {
          if (!i.abbonamento?.scadenza) return false;
          return moment(i.abbonamento.scadenza).isBefore(today, "day");
        });
      case "abbonamenti_in_scadenza":
        return filtered.filter((i) => {
          if (!i.abbonamento?.scadenza) return false;
          const scadenza = moment(i.abbonamento.scadenza);
          return (
            scadenza.isSameOrAfter(today, "day") &&
            scadenza.diff(today, "days") <= 30
          );
        });
      case "certificati_scaduti":
        return filtered.filter((i) => {
          if (!i.certificatoMedico?.scadenza) return false;
          return moment(i.certificatoMedico.scadenza).isBefore(today, "day");
        });
      case "certificati_mancanti":
        return filtered.filter((i) => i.certificatoMedico?.presente === false);
      case "certificati_in_scadenza":
        return filtered.filter((i) => {
          if (!i.certificatoMedico?.scadenza) return false;
          const scadenza = moment(i.certificatoMedico.scadenza);
          return (
            scadenza.isSameOrAfter(today, "day") &&
            scadenza.diff(today, "days") <= 30
          );
        });
      default:
        return filtered;
    }
  }, [iscrittiList, activeFilter, searchTerm, today]);

  // Condizione per mostrare la barra fissa
  const isSelected = selectedIds.length > 0;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Anagrafica Soci
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleToggleForm}
          startIcon={<AddIcon />}
          sx={{ color: "white" }}
        >
          Aggiungi Socio
        </Button>
      </Box>

      {/* Form di Aggiunta Socio come Dialog Modale */}
      <IscrittoForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onIscrittoAggiunto={onIscrittoAdded}
      />

      {/* Rimosso il Box che causava il reflow in cima */}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ricerca Socio
          </Typography>
          <TextField
            fullWidth
            placeholder="Cerca per nome o cognome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filtri Rapidi
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="Tutti"
              onClick={() => setActiveFilter("tutti")}
              color={activeFilter === "tutti" ? "primary" : "default"}
              variant={activeFilter === "tutti" ? "filled" : "outlined"}
            />
            <Chip
              label="Abbonamenti Scaduti"
              onClick={() => setActiveFilter("abbonamenti_scaduti")}
              color={
                activeFilter === "abbonamenti_scaduti" ? "error" : "default"
              }
              variant={
                activeFilter === "abbonamenti_scaduti" ? "filled" : "outlined"
              }
            />
            <Chip
              label="Abbonamenti in scadenza"
              onClick={() => setActiveFilter("abbonamenti_in_scadenza")}
              color={
                activeFilter === "abbonamenti_in_scadenza"
                  ? "warning"
                  : "default"
              }
              variant={
                activeFilter === "abbonamenti_in_scadenza"
                  ? "filled"
                  : "outlined"
              }
            />
            <Chip
              label="Certificati Scaduti"
              onClick={() => setActiveFilter("certificati_scaduti")}
              color={
                activeFilter === "certificati_scaduti" ? "error" : "default"
              }
              variant={
                activeFilter === "certificati_scaduti" ? "filled" : "outlined"
              }
            />
            <Chip
              label="Certificati Mancanti"
              onClick={() => setActiveFilter("certificati_mancanti")}
              color={
                activeFilter === "certificati_mancanti" ? "error" : "default"
              }
              variant={
                activeFilter === "certificati_mancanti" ? "filled" : "outlined"
              }
            />
            <Chip
              label="Certificati in scadenza"
              onClick={() => setActiveFilter("certificati_in_scadenza")}
              color={
                activeFilter === "certificati_in_scadenza"
                  ? "warning"
                  : "default"
              }
              variant={
                activeFilter === "certificati_in_scadenza"
                  ? "filled"
                  : "outlined"
              }
            />
          </Box>
        </Box>
        <IscrittiLista
          iscritti={filteredIscritti}
          onDataUpdate={onDataUpdate}
          onSelect={handleSelectIscritto}
          selection={selectedIds}
          activeFilter={activeFilter}
        />
      </Paper>

      {/* BARRA FIXED IN OVERLAY IN BASSO (Floating) */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24, // Distaccato dal basso (24px)
          left: DRAWER_WIDTH + 24, // Distaccato dalla sidebar (24px di margine)
          right: 24, // Distaccato dal lato destro (24px)
          zIndex: 1100,
          display: isSelected ? "block" : "none", // Nasconde quando non selezionato
        }}
      >
        <Paper
          elevation={6} // Aggiunge ombra per farlo "fluttuare"
          sx={{
            padding: 2,
            borderRadius: theme.shape.borderRadius * 2, // Arrotondamento marcato (16px)
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
          >
            {selectedIds.length} Soci Selezionati
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={handleExportSelected}
            startIcon={<FileDownloadIcon />}
          >
            Esporta Lista Gara (.xlsx)
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default IscrittiPage;
