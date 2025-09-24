// File: src/utils/exportToExcel.js

import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  // 1. Trasformiamo i dati nel formato richiesto: includiamo tutti i campi avanzati
  const formattedData = data.map(iscritto => ({
    'NOME': iscritto.nome || '',
    'COGNOME': iscritto.cognome || '',
    'CODICE FISCALE': iscritto.codiceFiscale || '',
    'DATA DI NASCITA': iscritto.dataNascita || '',
    'LIVELLO': iscritto.livello || 'N/D', 
    'CATEGORIA': iscritto.categoria || 'N/D', 
  }));

  // 2. Creiamo il foglio di lavoro
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Impostiamo l'auto-larghezza per le colonne
  const wscols = [
      {wch: 15}, // NOME
      {wch: 20}, // COGNOME
      {wch: 20}, // CODICE FISCALE
      {wch: 15}, // DATA DI NASCITA
      {wch: 15}, // LIVELLO
      {wch: 15}, // CATEGORIA
  ];
  worksheet['!cols'] = wscols;

  // 3. Creiamo il libro e aggiungiamo il foglio
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Atleti');

  // 4. Forziamo il download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};