import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import TitleIcon from "@mui/icons-material/Title";
import NotesIcon from "@mui/icons-material/Notes";
import moment from "moment";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const colors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
];

function EventEditDialog({ open, onClose, onSave, onDelete, event, dateInfo }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [color, setColor] = useState(colors[0]);
  const [reminderDate, setReminderDate] = useState("");
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitleError(false);
      return;
    }

    if (event) {
      const isAllDay = event.allDay;
      setTitle(event.title || "");
      setDescription(event.description || "");
      setAllDay(isAllDay);
      setColor(event.color || colors[0]);
      setReminderDate(event.reminderDate || "");
      setStart(
        moment(event.start).format(isAllDay ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm")
      );
      setEnd(
        moment(event.end || event.start).format(
          isAllDay ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm"
        )
      );
    } else if (dateInfo) {
      const isAllDay = dateInfo.allDay;
      setTitle("");
      setDescription("");
      setAllDay(isAllDay);
      setColor(colors[0]);
      setReminderDate("");
      const startDate = dateInfo.startStr || dateInfo.dateStr;
      const endDate = dateInfo.endStr || dateInfo.dateStr;
      setStart(
        moment(startDate).format(isAllDay ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm")
      );
      setEnd(
        moment(endDate).format(isAllDay ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm")
      );
    }
  }, [event, dateInfo, open]);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    onSave({
      id: event?.id,
      title,
      description,
      start,
      end: allDay ? null : end,
      allDay,
      color,
      reminderDate: reminderDate || null,
      // Se la data del promemoria viene modificata o aggiunta,
      // reimposta lo stato di "inviato" a false.
      reminderSent: event?.reminderDate === reminderDate ? event?.reminderSent : false,
    });
  };

  const handleDelete = () => event?.id && onDelete(event.id);
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (titleError) setTitleError(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {event ? "Modifica Evento" : "Nuovo Evento"}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {/* === LAYOUT CAMBIATO: DA GRID A FLEXBOX VERTICALE === */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* TITOLO A PIENA LARGHEZZA */}
          <TextField
            autoFocus
            fullWidth
            label="Titolo Evento"
            value={title}
            onChange={handleTitleChange}
            error={titleError}
            helperText={titleError ? "Il titolo è obbligatorio." : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* NOTE A PIENA LARGHEZZA */}
          <TextField
            fullWidth
            label="Note / Descrizione"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NotesIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* SWITCH "TUTTO IL GIORNO" */}
          <FormControlLabel
            control={
              <Switch
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
            }
            label="Tutto il giorno"
          />

          {/* CONTENITORE PER DATA/ORA (FLEXBOX ORIZZONTALE) */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Inizio"
              type={allDay ? "date" : "datetime-local"}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            {!allDay && (
              <TextField
                fullWidth
                label="Fine"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>

          {/* DATA PROMEMORIA */}
          <TextField
            fullWidth
            label="Data Promemoria (opzionale)"
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NotificationsActiveIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* COLORE EVENTO */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              sx={{ color: "text.secondary", mb: 1.5 }}
            >
              Colore Evento
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {colors.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: c,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid",
                    borderColor: color === c ? c : "transparent",
                    outline: color === c ? `2px solid #fff` : "none",
                    boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.15)" },
                  }}
                >
                  {color === c && (
                    <CheckIcon sx={{ color: "#fff", fontSize: 20 }} />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", p: "16px 24px" }}>
        {event ? (
          <Button
            onClick={handleDelete}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Elimina
          </Button>
        ) : (
          <Box />
        )}
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Annulla
          </Button>
          <Button onClick={handleSave} variant="contained" size="large">
            Salva Evento
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default EventEditDialog;
