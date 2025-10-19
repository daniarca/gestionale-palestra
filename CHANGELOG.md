# Changelog

## Versione 0.12.0 (2025-10-19)

### ✨ Miglioramenti

- **Gestione Pagamenti**: È ora possibile inserire una data specifica per un pagamento, consentendo di registrare pagamenti retroattivi. Aggiunto un selettore di data nel dialogo di aggiunta pagamento.
- **Report Finanziario**: Aggiunto un pulsante per eliminare le singole transazioni direttamente dalla tabella nel report finanziario. Questo permette di rimuovere pagamenti errati o associati a soci non più esistenti.

### 🐞 Bug Fix

- **Storico Pagamenti**: Risolto un problema critico per cui le quote di iscrizione non venivano mostrate nella lista delle transazioni di un socio. Ora tutte le quote di iscrizione sono correttamente visibili.
- **Report Finanziario**: Risolto un bug che escludeva le quote di iscrizione dal calcolo degli incassi totali. La logica è stata modificata per includere anche i pagamenti delle iscrizioni effettuati nei due mesi precedenti l'inizio dell'anno sportivo (Luglio e Agosto).
- **Report Finanziario**: Risolto un crash che si verificava sulla pagina del report finanziario quando veniva eliminata l'ultima transazione presente.
- **Gestione Iscrizioni**: Annullata una modifica errata che collegava il pagamento della quota di iscrizione alla data di scadenza dell'abbonamento mensile. Le due entità sono ora gestite separatamente come richiesto.
