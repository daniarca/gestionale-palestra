import moment from "moment";

export function getStatoAbbonamento(abbonamento) {
  if (!abbonamento?.scadenza) return "Nessun abbonamento";
  
  const oggi = moment();
  const scadenza = moment(abbonamento.scadenza);
  const giorno = oggi.date();

  if (oggi.isBefore(scadenza, 'day')) return "Attivo";
  if (oggi.isSame(scadenza, 'day') || (oggi.isAfter(scadenza, 'day') && giorno <= 7)) return "In Grace Period";
  return "Scaduto";
}
