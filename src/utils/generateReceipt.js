import { numberToWords } from './numberToWords.js';

function formatDate(dateString) {
  if (!dateString) return 'N/D';
  return new Date(dateString).toLocaleDateString('it-IT');
}

export function generateReceipt(iscritto, pagamenti, logoImage, firmaImage) {
  if (!iscritto) {
    console.error("Dati dell'iscritto non disponibili per la stampa.");
    return;
  }

  const oggi = new Date();
  const annoCorrente = oggi.getFullYear();
  const meseCorrente = oggi.getMonth();
  const annoInizioCorrente = meseCorrente < 8 ? annoCorrente - 1 : annoCorrente;
  
  const inizioAnnoSportivo = new Date(annoInizioCorrente, 8, 1);
  const fineAnnoSportivo = new Date(annoInizioCorrente + 1, 5, 30);

  const pagamentiAnno = pagamenti.filter(p => {
    const dataPagamento = new Date(p.dataPagamento);
    return dataPagamento >= inizioAnnoSportivo && dataPagamento <= fineAnnoSportivo;
  });

  const totalePagato = pagamentiAnno.reduce((sum, p) => sum + p.cifra, 0);

  const [integerPart, decimalPart] = totalePagato.toFixed(2).split('.');
  const importoInLettere = `${numberToWords(parseInt(integerPart, 10))}/${decimalPart}`;

  const isMinorenne = iscritto.nomeGenitore && iscritto.nomeGenitore.trim() !== '';
  const nomeVersante = isMinorenne ? iscritto.nomeGenitore : `${iscritto.nome} ${iscritto.cognome}`;
  const cfVersante = isMinorenne ? iscritto.cfGenitore : iscritto.codiceFiscale;
  
  const beneficiarioText = isMinorenne 
    ? `<div>Per conto del/della socio/a:</div>` 
    : '';

  const printContent = `
    <html>
      <head>
        <title>Certificazione ${iscritto.cognome}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 30px 50px; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h3, .header p { margin: 0; }
          .header img.logo { max-width: 150px; height: auto; margin-bottom: 10px; }
          .receipt-title { font-size: 14pt; font-weight: bold; margin: 20px 0; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .info-block { margin-top: 20px; }
          .info-block div { margin-bottom: 10px; line-height: 1.5; }
          .line { display: inline-block; border-bottom: 1px dashed #000; padding: 0 5px; font-weight: bold; }
          .signature-area { margin-top: 50px; text-align: center; }
          .signature-area img { max-width: 200px; height: auto; display: block; margin: 10px auto; }
          .center-text { text-align: center; }
          .footer { margin-top: 50px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoImage}" alt="A.S.D. GYM POINT Logo" class="logo" />
          <h3>A.S.D. GYM POINT</h3>
          <p>VIA DEL CAMPO SPORTIVO ROCCA PRIORA 00079 (RM)</p>
          <p>VIA MASSIMO D'AZEGLIO n.12 FRASCATI (RM)</p>
          <p>C.F. 92022510587</p>
        </div>
        <div class="center-text receipt-title">RICEVUTA DI PAGAMENTO SOCIO (anno) ${annoCorrente}</div>
        <div class="info-block">
          <div>Si certifica che Il/la Signor/a: <span class="line">${nomeVersante}</span></div>
          <div>Codice Fiscale: <span class="line">${cfVersante}</span></div>
        </div>
        <div class="center-text receipt-title">HA VERSATO</div>
        <div class="info-block">
          <div>La quota associativa di: €${totalePagato.toFixed(2)} (<span class="line">${importoInLettere}</span>)</div>
          <div>Per l'anno/stagione <span class="line">${annoInizioCorrente}/${annoInizioCorrente + 1}</span></div>
          <div>A titolo di ISCRIZIONE AD ATTIVITÀ SPORTIVA DILETTANTISTICA per la partecipazione al corso di Ginnastica Artistica.</div>
        </div>
        
        <div class="info-block">
          ${beneficiarioText}
          <div>Dati del socio iscritto: <span class="line">${iscritto.nome} ${iscritto.cognome}</span></div>
          <div>nato/a a <span class="line">${iscritto.luogoNascita || 'N/D'}</span> il <span class="line">${formatDate(iscritto.dataNascita)}</span></div>
          <div>residente a <span class="line">${iscritto.residenza || 'N/D'}</span>, in <span class="line">${iscritto.via || 'N/D'}</span> N°. <span class="line">${iscritto.numeroCivico || 'N/D'}</span></div>
        </div>
        <div class="footer">
          <p>${iscritto.sede || 'N/D'}, lì ${oggi.toLocaleDateString('it-IT')}</p>
        </div>
        <div class="signature-area">
          <img src="${firmaImage}" alt="Firma" />
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Impossibile aprire la finestra di stampa. Controlla le impostazioni del tuo browser per i pop-up.");
    return;
  }

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  }, 500);
}