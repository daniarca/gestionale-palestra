// File: src/components/StoricoPagamenti.jsx

import React, { useState, useMemo } from 'react';
import { Typography, Grid, Box, Tooltip, FormControl, Select, MenuItem } from '@mui/material';

const annoSportivoMesi = [
  { nome: 'Set', index: 8 }, { nome: 'Ott', index: 9 }, { nome: 'Nov', index: 10 }, 
  { nome: 'Dic', index: 11 }, { nome: 'Gen', index: 0 }, { nome: 'Feb', index: 1 }, 
  { nome: 'Mar', index: 2 }, { nome: 'Apr', index: 3 }, { nome: 'Mag', index: 4 }, 
  { nome: 'Giu', index: 5 }
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

function StoricoPagamenti({ pagamenti = [], quotaMensile = 60 }) {
  const anniDisponibili = generaAnniSportivi();
  const [annoSelezionato, setAnnoSelezionato] = useState(anniDisponibili[1]);

  const datiAnnoSelezionato = useMemo(() => {
    const [startYear] = annoSelezionato.split('/');
    // L'anno sportivo va da Settembre (mese 8) a Giugno (mese 5 dell'anno dopo)
    const inizioAnnoSportivo = new Date(parseInt(startYear), 8, 1);
    const fineAnnoSportivo = new Date(parseInt(startYear) + 1, 6, 0); // Ultimo giorno di Giugno

    const pagamentiFiltrati = pagamenti.filter(p => {
      // Usiamo la data di pagamento per filtrare nell'anno sportivo
      if (!p.dataPagamento) return false;
      const dataPagamento = new Date(p.dataPagamento);
      return dataPagamento >= inizioAnnoSportivo && dataPagamento <= fineAnnoSportivo;
    });

    const pagamentiPerMese = {};
    pagamentiFiltrati.forEach(p => {
      if(typeof p.tipo === 'string' && p.tipo.toLowerCase().includes('mensile')) {
        // FIX CRITICO: Usa meseRiferimento salvato al momento del pagamento
        const mese = p.meseRiferimento; 
        
        if (mese != null) { 
             pagamentiPerMese[mese] = (pagamentiPerMese[mese] || 0) + p.cifra;
        }
      }
    });

    const iscrizionePagata = pagamentiFiltrati.find(p => typeof p.tipo === 'string' && p.tipo.toLowerCase().includes('iscrizione'));

    return { pagamentiPerMese, iscrizionePagata };
  }, [pagamenti, annoSelezionato, quotaMensile]);

  const getMeseStatus = (meseIndex) => {
    const totalePagato = datiAnnoSelezionato.pagamentiPerMese[meseIndex] || 0;
    const qm = Number(quotaMensile) || 60;
    if (qm > 0 && totalePagato >= qm) return { color: 'success.main', label: `Pagato: ${totalePagato}€` };
    if (totalePagato > 0) return { color: 'warning.main', label: `Acconto: ${totalePagato}€` };
    return { color: 'rgba(255, 255, 255, 0.05)', label: 'Non pagato' };
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>Stato Pagamenti</Typography>
        <FormControl size="small">
          <Select value={annoSelezionato} onChange={(e) => setAnnoSelezionato(e.target.value)}>
            {anniDisponibili.map(anno => (
              <MenuItem key={anno} value={anno}>{anno}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={2.4}>
          <Tooltip title={datiAnnoSelezionato.iscrizionePagata ? `Iscrizione Pagata: ${datiAnnoSelezionato.iscrizionePagata.cifra}€` : 'Iscrizione non pagata per quest\'anno'}>
            <Box sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, backgroundColor: datiAnnoSelezionato.iscrizionePagata ? 'info.main' : 'rgba(255, 255, 255, 0.05)', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: datiAnnoSelezionato.iscrizionePagata ? '#1E1E2E' : 'text.primary' }}>ISC</Typography>
            </Box>
          </Tooltip>
        </Grid>
        {annoSportivoMesi.map(mese => {
          const status = getMeseStatus(mese.index);
          return (
            <Grid item xs={2.4} key={mese.nome}>
              <Tooltip title={status.label} placement="top">
                <Box sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, backgroundColor: status.color, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: (status.color === 'success.main' || status.color === 'warning.main') ? '#1E1E2E' : 'text.primary' }}>
                    {mese.nome}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default StoricoPagamenti;