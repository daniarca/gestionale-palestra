// File: src/utils/exportToExcel.js

import * as XLSX from 'xlsx';

/**
 * Esporta un array di oggetti in un file Excel (.xlsx).
 * @param {Array<Object>} data L'array di oggetti da esportare.
 * @param {string} fileName Il nome del file di output.
 * @param {boolean} [skipFormatting=false] Se true, salta la formattazione standard per la lista atleti. 
 * Usare true per report personalizzati (come la matrice bonifico).
 */
export const exportToExcel = (data, fileName, skipFormatting = false) => {
  if (!data || data.length === 0) {
    console.warn("Nessun dato da esportare.");
    // Non eseguiamo l'esportazione se i dati sono vuoti
    return;
  }
    
  let formattedData = data;
  
  if (!skipFormatting) {
      // 1. Logica di formattazione per la lista standard (es. Export Lista Gara)
      formattedData = data.map(iscritto => ({
          'NOME': iscritto.nome || '',
          'COGNOME': iscritto.cognome || '',
          'CODICE FISCALE': iscritto.codiceFiscale || '',
          'DATA DI NASCITA': iscritto.dataNascita || '',
          'LIVELLO': iscritto.livello || 'N/D', 
          'CATEGORIA': iscritto.categoria || 'N/D', 
      }));
  }

  // 2. Creiamo il foglio di lavoro
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Impostiamo l'auto-larghezza per le colonne in base alle chiavi
  const keys = formattedData.length > 0 ? Object.keys(formattedData[0]) : [];
  const wscols = keys.map(key => ({
      // Larghezza minima 15 o la lunghezza dell'intestazione, massimo 30
      wch: Math.min(30, Math.max(15, key.length + 2)) 
  }));
  worksheet['!cols'] = wscols;

  // 3. Creiamo il libro e aggiungiamo il foglio
  const workbook = XLSX.utils.book_new();
  const sheetName = fileName.startsWith('Report') ? 'Report' : 'Lista Atleti'; 
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 4. Forziamo il download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};