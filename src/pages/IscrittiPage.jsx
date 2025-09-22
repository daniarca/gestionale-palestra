import { useState, useMemo } from "react";
import { Box, Typography, Button, Paper, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import IscrittoForm from "../components/IscrittoForm.jsx";
import IscrittiLista from "../components/IscrittiLista.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import moment from "moment";

function IscrittiPage({ iscrittiList, onDataUpdate, onIscrittoAdded }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("tutti");
  const showNotification = useNotification();

  const handleToggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleIscrittoAdded = () => {
    handleToggleForm();
    onIscrittoAdded();
  };

  const today = moment();
  const filteredIscritti = useMemo(() => {
    switch (activeFilter) {
      case "abbonamenti_scaduti":
        return iscrittiList.filter((i) => {
          if (!i.abbonamento?.scadenza) return false;
          return moment(i.abbonamento.scadenza).isBefore(today, "day");
        });
      case "abbonamenti_in_scadenza":
        return iscrittiList.filter((i) => {
          if (!i.abbonamento?.scadenza) return false;
          const scadenza = moment(i.abbonamento.scadenza);
          return (
            scadenza.isSameOrAfter(today, "day") &&
            scadenza.diff(today, "days") <= 30
          );
        });
      case "certificati_scaduti":
        return iscrittiList.filter((i) => {
          if (!i.certificatoMedico?.scadenza) return false;
          return moment(i.certificatoMedico.scadenza).isBefore(today, "day");
        });
      case "certificati_mancanti":
        return iscrittiList.filter(
          (i) => i.certificatoMedico?.presente === false
        );
      case "certificati_in_scadenza":
        return iscrittiList.filter((i) => {
          if (!i.certificatoMedico?.scadenza) return false;
          const scadenza = moment(i.certificatoMedico.scadenza);
          return (
            scadenza.isSameOrAfter(today, "day") &&
            scadenza.diff(today, "days") <= 30
          );
        });
      default:
        return iscrittiList;
    }
  }, [iscrittiList, activeFilter, today]);

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
        >
          {isFormOpen ? "Chiudi Form" : "Aggiungi Iscritto"}
        </Button>
      </Box>

      {isFormOpen && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <IscrittoForm onIscrittoAdded={handleIscrittoAdded} />
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
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
          activeFilter={activeFilter}
        />
      </Paper>
    </Box>
  );
}

export default IscrittiPage;
