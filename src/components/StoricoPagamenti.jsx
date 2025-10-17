// File: src/components/StoricoPagamenti.jsx
import React, { useState, useMemo } from "react";
import {
  Typography,
  Grid,
  Box,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { deletePayment } from "../firebase"; // ✅ import funzione di eliminazione
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase"; // nel caso deletePayment non venga usato

const annoSportivoMesi = [
  { nome: "Set", index: 8 },
  { nome: "Ott", index: 9 },
  { nome: "Nov", index: 10 },
  { nome: "Dic", index: 11 },
  { nome: "Gen", index: 0 },
  { nome: "Feb", index: 1 },
  { nome: "Mar", index: 2 },
  { nome: "Apr", index: 3 },
  { nome: "Mag", index: 4 },
  { nome: "Giu", index: 5 },
];

const generaAnniSportivi = () => {
  const annoCorrente = new Date().getFullYear();
  const meseCorrente = new Date().getMonth();
  const annoInizioCorrente = meseCorrente < 8 ? annoCorrente - 1 : annoCorrente;

  return [
    `${annoInizioCorrente - 1}/${annoInizioCorrente}`,
    `${annoInizioCorrente}/${annoInizioCorrente + 1}`,
    `${annoInizioCorrente + 1}/${annoInizioCorrente + 2}`,
  ];
};

function StoricoPagamenti({
  pagamenti = [],
  quotaMensile = 60,
  quotaIscrizione = 0,
}) {
  const anniDisponibili = generaAnniSportivi();
  const [annoSelezionato, setAnnoSelezionato] = useState(anniDisponibili[1]);
  const [eliminazioneInCorso, setEliminazioneInCorso] = useState(false);

  const datiAnnoSelezionato = useMemo(() => {
    const [startYear] = annoSelezionato.split("/");
    const inizioAnnoSportivo = new Date(parseInt(startYear), 8, 1);
    const fineAnnoSportivo = new Date(parseInt(startYear) + 1, 6, 0);

    const pagamentiFiltrati = pagamenti.filter((p) => {
      if (!p.dataPagamento) return false;
      const dataPagamento = new Date(p.dataPagamento);
      return (
        dataPagamento >= inizioAnnoSportivo && dataPagamento <= fineAnnoSportivo
      );
    });

    const pagamentiPerMese = {};
    pagamentiFiltrati.forEach((p) => {
      if (
        typeof p.tipo === "string" &&
        p.tipo.toLowerCase().includes("mensile")
      ) {
        const mese = p.meseRiferimento;
        if (mese != null) {
          pagamentiPerMese[mese] = (pagamentiPerMese[mese] || 0) + p.cifra;
        }
      }
    });

    return { pagamentiFiltrati, pagamentiPerMese };
  }, [pagamenti, annoSelezionato]);

  const getMeseStatus = (meseIndex) => {
    const totalePagato = datiAnnoSelezionato.pagamentiPerMese[meseIndex] || 0;
    const qm = Number(quotaMensile) || 60;
    if (qm > 0 && totalePagato >= qm)
      return {
        color: "success.main",
        label: `Pagato: ${totalePagato.toFixed(2)}€`,
      };
    if (totalePagato > 0)
      return {
        color: "warning.main",
        label: `Acconto: ${totalePagato.toFixed(2)}€`,
      };
    return { color: "rgba(255, 255, 255, 0.05)", label: "Non pagato" };
  };

  const totalSubscriptionPaid = Number(quotaIscrizione) || 0;

  // ✅ funzione eliminazione pagamento
  const handleDelete = async (payment) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo pagamento?")) return;

    setEliminazioneInCorso(true);
    try {
      if (payment.id) {
        // Prova a usare la helper deletePayment se disponibile
        await deletePayment("pagamenti", payment.id);
      } else if (payment.docId) {
        // Alcuni pagamenti potrebbero avere docId invece di id
        await deletePayment("pagamenti", payment.docId);
      } else {
        console.warn("Pagamento senza id:", payment);
        throw new Error("Pagamento senza ID documento");
      }

      alert("Pagamento eliminato con successo.");
      // Aggiorna la UI rimuovendo il pagamento eliminato
      window.location.reload();
    } catch (e) {
      console.error("Errore eliminazione pagamento:", e);
      alert("Errore durante l'eliminazione del pagamento.");
    } finally {
      setEliminazioneInCorso(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* SEZIONE BOLLE (INVARIATA) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Stato Pagamenti
        </Typography>
        <FormControl size="small">
          <Select
            value={annoSelezionato}
            onChange={(e) => setAnnoSelezionato(e.target.value)}
          >
            {anniDisponibili.map((anno) => (
              <MenuItem key={anno} value={anno}>
                {anno}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={2.4}>
          <Tooltip
            title={
              totalSubscriptionPaid > 0
                ? `Totale Iscrizione Pagata: ${totalSubscriptionPaid.toFixed(
                    2
                  )}€`
                : "Iscrizione non pagata"
            }
          >
            <Box
              sx={{
                p: 1.5,
                textAlign: "center",
                borderRadius: 2,
                backgroundColor:
                  totalSubscriptionPaid > 0
                    ? "info.main"
                    : "rgba(255, 255, 255, 0.05)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  color: totalSubscriptionPaid > 0 ? "#1E1E2E" : "text.primary",
                }}
              >
                ISC
              </Typography>
            </Box>
          </Tooltip>
        </Grid>
        {annoSportivoMesi.map((mese) => {
          const status = getMeseStatus(mese.index);
          return (
            <Grid item xs={2.4} key={mese.nome}>
              <Tooltip title={status.label} placement="top">
                <Box
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    borderRadius: 2,
                    backgroundColor: status.color,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color:
                        status.color === "success.main" ||
                        status.color === "warning.main"
                          ? "#1E1E2E"
                          : "text.primary",
                    }}
                  >
                    {mese.nome}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {/* 🔽 NUOVA SEZIONE: elenco transazioni con possibilità di eliminazione */}
      {datiAnnoSelezionato.pagamentiFiltrati.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Transazioni registrate ({datiAnnoSelezionato.pagamentiFiltrati.length})
          </Typography>

          {datiAnnoSelezionato.pagamentiFiltrati.map((p) => (
            <Box
              key={p.id || p.docId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                mb: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {p.tipo || "Pagamento"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(p.dataPagamento).toLocaleDateString("it-IT")} —{" "}
                  {p.cifra?.toFixed(2)}€
                </Typography>
              </Box>
              <Tooltip title="Elimina pagamento">
                <span>
                  <IconButton
                    color="error"
                    disabled={eliminazioneInCorso}
                    onClick={() => handleDelete(p)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}

export default StoricoPagamenti;
