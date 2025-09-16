import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  // 1. Trasformiamo i dati nel formato richiesto: una sola colonna "ATLETA"
  const formattedData = data.map(iscritto => ({
    'ATLETA': `${iscritto.cognome || ''} ${iscritto.nome || ''}`.trim()
  }));

  // 2. Creiamo il foglio di lavoro
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // 3. Creiamo il libro e aggiungiamo il foglio
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Atleti Gara');

  // 4. Forziamo il download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};