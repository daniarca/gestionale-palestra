// File: src/utils/timeSlots.js (Nuovo File)

export const giorniSettimana = [
  { label: 'Lunedì', value: 1 }, { label: 'Martedì', value: 2 }, { label: 'Mercoledì', value: 3 },
  { label: 'Giovedì', value: 4 }, { label: 'Venerdì', value: 5 }, { label: 'Sabato', value: 6 }, { label: 'Domenica', value: 0 }
];

// Genera orari dalle 08:00 alle 21:30 con intervalli di 30 minuti
export const orari = Array.from({ length: (22 - 8) * 2 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});