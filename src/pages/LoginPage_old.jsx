// File: src/pages/IscrittiPage.jsx

import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  Stack,
  IconButton, // Aggiunto
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule"; // Icona per la griglia
import ViewListIcon from "@mui/icons-material/ViewList"; // Icona per la lista
import IscrittoForm from "../components/IscrittoForm.jsx";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import IscrittiLista from "../components/IscrittiLista.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { exportToExcel } from "../utils/exportToExcel.js";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import moment from "moment";
import { addIscritto } from "../services/firebaseService.js";

const DRAWER_WIDTH = 280;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function IscrittiPage({
  iscrittiList,
  gruppiList,
  onDataUpdate,
  onIscrittoAdded,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("tutti");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  // Stato per la visualizzazione, legge il valore salvato in localStorage o usa 'grid' di default
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("viewMode") || "grid"
  );

  const { showNotification } = useNotification();
  const theme = useTheme();
  const query = useQuery();
  const navigate = useNavigate();

  const gruppoIdFromUrl = query.get("gruppoId");

  useEffect(() => {
    if (gruppoIdFromUrl) {
      setActiveFilter(`gruppo_${gruppoIdFromUrl}`);
    } else {
      if (activeFilter.startsWith("gruppo_")) {
        setActiveFilter("tutti");
      }
    }
  }, [gruppoIdFromUrl]);

  // Salva la preferenza di visualizzazione nel localStorage ogni volta che cambia
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  const activeGruppoFilter = useMemo(() => {
    if (!activeFilter.startsWith("gruppo_")) return null;
    const gruppoId = activeFilter.split("_")[1];
    return gruppiList.find((g) => g.id === gruppoId);
  }, [activeFilter, gruppiList]);

  const handleToggleForm = () => setIsFormOpen(!isFormOpen);
  const handleCloseForm = () => setIsFormOpen(false);

  const handleSaveIscritto = async (nuovoIscritto) => {
    try {
      const nuovoIscrittoConId = await addIscritto(nuovoIscritto);
      onIscrittoAdded(nuovoIscrittoConId);
      showNotification("Socio aggiunto con successo!", "success");
      handleCloseForm();
    } catch (error) {
      console.error("Errore durante l'aggiunta del socio:", error);
      showNotification("Errore durante il salvataggio del socio.", "error");
    }
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
    let baseList = iscrittiList;

    if (activeFilter.startsWith("gruppo_")) {
      const gruppoId = activeFilter.split("_")[1];
      const gruppo = gruppiList.find((g) => g.id === gruppoId);
      if (gruppo && gruppo.membri) {
        const membriIds = new Set(gruppo.membri);
        baseList = baseList.filter((iscritto) => membriIds.has(iscritto.id));
      } else {
        return [];
      }
    } else {
      switch (activeFilter) {
        case "abbonamenti_scaduti":
          baseList = baseList.filter((i) => {
            if (!i.abbonamento?.scadenza) return false;
            return moment(i.abbonamento.scadenza).isBefore(today, "day");
          });
          break;
        case "abbonamenti_in_scadenza":
          baseList = baseList.filter((i) => {
            if (!i.abbonamento?.scadenza) return false;
            const scadenza = moment(i.abbonamento.scadenza);
            return (
              scadenza.isSameOrAfter(today, "day") &&
              scadenza.diff(today, "days") <= 30
            );
          });
          break;
        case "certificati_scaduti":
          baseList = baseList.filter((i) => {
            if (!i.certificatoMedico?.scadenza) return false;
            return moment(i.certificatoMedico.scadenza).isBefore(today, "day");
          });
          break;
        case "certificati_mancanti":
          baseList = baseList.filter(
            (i) => i.certificatoMedico?.presente === false
          );
          break;
        case "certificati_in_scadenza":
          baseList = baseList.filter((i) => {
            if (!i.certificatoMedico?.scadenza) return false;
            const scadenza = moment(i.certificatoMedico.scadenza);
            return (
              scadenza.isSameOrAfter(today, "day") &&
              scadenza.diff(today, "days") <= 30
            );
          });
          break;
        default:
          break;
      }
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      baseList = baseList.filter(
        (i) =>
          i.nome.toLowerCase().includes(lowercasedSearchTerm) ||
          i.cognome.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // Ordinamento per cognome
    return [...baseList].sort((a, b) => a.cognome.localeCompare(b.cognome));
  }, [iscrittiList, gruppiList, activeFilter, searchTerm, today]);

  const isSelected = selectedIds.length > 0;

  const areAllSelected = useMemo(
    () =>
      filteredIscritti.length > 0 &&
      selectedIds.length === filteredIscritti.length,
    [filteredIscritti.length, selectedIds.length]
  );

  const handleToggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIscritti.map((i) => i.id));
    }
  };

  const clearGruppoFilter = () => {
    navigate("/iscritti");
  };

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

      <IscrittoForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onIscrittoAggiunto={handleSaveIscritto}
      />

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
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
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vista
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => setViewMode("grid")}
                color={viewMode === "grid" ? "primary" : "default"}
              >
                <ViewModuleIcon />
              </IconButton>
              <IconButton
                onClick={() => setViewMode("list")}
                color={viewMode === "list" ? "primary" : "default"}
              >
                <ViewListIcon />
              </IconButton>
            </Stack>
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filtri
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {activeGruppoFilter ? (
              <Chip
                label={`Gruppo: ${activeGruppoFilter.nome}`}
                color="secondary"
                onDelete={clearGruppoFilter}
              />
            ) : (
              <>
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
                    activeFilter === "abbonamenti_scaduti"
                      ? "filled"
                      : "outlined"
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
                    activeFilter === "certificati_scaduti"
                      ? "filled"
                      : "outlined"
                  }
                />
                <Chip
                  label="Certificati Mancanti"
                  onClick={() => setActiveFilter("certificati_mancanti")}
                  color={
                    activeFilter === "certificati_mancanti"
                      ? "error"
                      : "default"
                  }
                  variant={
                    activeFilter === "certificati_mancanti"
                      ? "filled"
                      : "outlined"
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
              </>
            )}
          </Stack>
        </Box>
        <IscrittiLista
          iscritti={filteredIscritti}
          onDataUpdate={onDataUpdate}
          onSelect={handleSelectIscritto}
          selection={selectedIds}
          activeFilter={activeFilter}
          viewMode={viewMode} // Passa la modalità di visualizzazione al componente lista
        />
      </Paper>

      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          left: DRAWER_WIDTH + 24,
          right: 24,
          zIndex: 1100,
          display: isSelected ? "block" : "none",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 2,
            borderRadius: theme.shape.borderRadius * 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center", // Allineamento verticale
            gap: 2, // Spazio tra gli elementi
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
            >
              {selectedIds.length} Soci Selezionati
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleToggleSelectAll}
              startIcon={<SelectAllIcon />}
            >
              {areAllSelected ? "Deseleziona Tutti" : "Seleziona Tutti"}
            </Button>
          </Stack>
          <Button
            variant="contained"
            color="success"
            onClick={handleExportSelected}
            startIcon={<FileDownloadIcon />}
            sx={{
              color: "white",
            }}
          >
            Esporta Lista Gara (.xlsx)
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default IscrittiPage;
