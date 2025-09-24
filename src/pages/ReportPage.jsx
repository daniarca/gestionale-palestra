// File: src/pages/ReportPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../firebase.js';
import { Typography, Grid, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, FormControl, Select, MenuItem, InputLabel, TextField, InputAdornment } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import PaidIcon from '@mui/icons-material/Paid';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import moment from 'moment';

const MESI = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

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

function ReportPage() {
  const [pagamenti, setPagamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // NUOVO STATO: Ricerca
  const theme = useTheme();

  const anniDisponibili = useMemo(() => generaAnniSportivi(), []);
  const [annoSelezionato, setAnnoSelezionato] = useState(anniDisponibili[1]); // Anno sportivo corrente
  
  // Colori tematici coerenti per i grafici (più di 4 per la torta)
  const chartColors = [
      theme.palette.primary.main, 
      theme.palette.info.main, 
      theme.palette.success.main, 
      theme.palette.secondary.main, 
      theme.palette.warning.main, 
      theme.palette.error.main
  ];

  useEffect(() => {
    const fetchPagamenti = async () => {
      try {
        const q = query(collection(db, "pagamenti"), orderBy("dataPagamento", "desc"));
        const querySnapshot = await getDocs(q);
        const pagamentiList = querySnapshot.docs.map(doc => doc.data());
        setPagamenti(pagamentiList);
      } catch (error) { console.error("Errore: ", error); } 
      finally { setLoading(false); }
    };
    fetchPagamenti();
  }, []);

  const stats = useMemo(() => {
    const [startYearStr, endYearStr] = annoSelezionato.split('/');
    const startYear = parseInt(startYearStr);
    
    // Definisce l'intervallo dell'anno sportivo selezionato (Settembre AAAA a Giugno AAAA+1)
    const inizioAnnoSportivo = moment().year(startYear).month(8).date(1).startOf('day'); 
    const fineAnnoSportivo = moment().year(parseInt(endYearStr)).month(5).date(30).endOf('day'); 

    // Filtra i pagamenti nell'Anno Sportivo Selezionato
    const pagamentiAnnoSportivo = pagamenti.filter(p => {
        if (!p.dataPagamento) return false;
        const dataPagamento = moment(p.dataPagamento);
        return dataPagamento.isBetween(inizioAnnoSportivo, fineAnnoSportivo, 'day', '[]');
    });

    // 1. Incasso Mensile per Grafico a Barre
    const incassoPerMese = Array(12).fill(0);
    pagamentiAnnoSportivo.forEach(p => {
      const mese = moment(p.dataPagamento).month();
      incassoPerMese[mese] += p.cifra;
    });

    let datiGraficoBarre = MESI.map((mese, index) => ({ name: mese, Incasso: incassoPerMese[index] }));
    
    // Ordina da Settembre a Agosto per visualizzare l'Anno Sportivo
    const order = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7]; 
    datiGraficoBarre = order.map(i => datiGraficoBarre[i]);


    // 2. Grafico a Torta per Tipo di Pagamento (MIGLIORIA)
    const incassoPerTipo = pagamentiAnnoSportivo.reduce((acc, p) => {
      const tipo = p.tipo || 'Altro';
      acc[tipo] = (acc[tipo] || 0) + p.cifra;
      return acc;
    }, {});
    const datiGraficoTorta = Object.keys(incassoPerTipo).map(key => ({ name: key, value: incassoPerTipo[key] }));


    // 3. Metriche Totali
    const incassoTotaleStorico = pagamenti.reduce((sum, p) => sum + p.cifra, 0);
    const incassoAnnoSelezionato = pagamentiAnnoSportivo.reduce((sum, p) => sum + p.cifra, 0);
    const numTransazioniAnno = pagamentiAnnoSportivo.length;
    
    // 4. Filtro per Search Bar (Transazioni Utente)
    const lowerSearchTerm = searchTerm.toLowerCase();
    const transazioniFiltrateUtente = pagamentiAnnoSportivo
        .filter(p => p.iscrittoNome.toLowerCase().includes(lowerSearchTerm));

    return { 
        incassoTotaleStorico, 
        incassoAnnoSelezionato, 
        numTransazioniAnno,
        datiGraficoBarre, 
        datiGraficoTorta,
        pagamentiAnnoSportivo,
        transazioniFiltrateUtente,
    };
  }, [pagamenti, annoSelezionato, searchTerm]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Report Finanziario</Typography>
      
      {/* SEZIONE FILTRO ANNO */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Grid container alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Analisi Anno Sportivo:</Typography>
            <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Anno</InputLabel>
                <Select value={annoSelezionato} label="Anno" onChange={(e) => setAnnoSelezionato(e.target.value)}>
                    {anniDisponibili.map(anno => (
                        <MenuItem key={anno} value={anno}>{anno}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
      </Paper>
      

      {/* STATISTICHE RIEPILOGO */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Incasso Totale Storico" 
            value={`${stats.incassoTotaleStorico.toFixed(2)}€`} 
            icon={<PaidIcon />} 
            color={theme.palette.secondary.main} 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title={`Incasso Anno ${annoSelezionato}`} 
            value={`${stats.incassoAnnoSelezionato.toFixed(2)}€`} 
            icon={<AttachMoneyIcon />} 
            color={theme.palette.primary.main} 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title={`Transazioni Anno ${annoSelezionato}`} 
            value={stats.numTransazioniAnno} 
            icon={<ReceiptIcon />} 
            color={theme.palette.info.main} 
          />
        </Grid>
      </Grid>

      {/* GRAFICI */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}> 
            <Typography variant="h6">Incassi Mensili (Anno Sportivo)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats.datiGraficoBarre} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: '1px solid ' + theme.palette.divider }}/>
                <Legend />
                <Bar dataKey="Incasso" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
            <Typography variant="h6">Divisione per Tipo di Pagamento</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={stats.datiGraficoTorta} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.datiGraficoTorta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: '1px solid ' + theme.palette.divider }}/>
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* SEARCH BAR E TABELLA TRANSAZIONI UTENTE */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>Storico Transazioni {searchTerm ? `per "${searchTerm}"` : `Anno ${annoSelezionato}`}</Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
            fullWidth
            placeholder="Cerca per nome o cognome del socio (es. Mario Rossi)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Atleta</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Sede</TableCell>
              <TableCell align="right">Importo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.transazioniFiltrateUtente.length > 0 ? (
                stats.transazioniFiltrateUtente.map((p, index) => (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{moment(p.dataPagamento).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{p.iscrittoNome}</TableCell>
                      <TableCell>{p.tipo}</TableCell>
                      <TableCell>{p.sede}</TableCell>
                      <TableCell align="right">{p.cifra.toFixed(2)}€</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} align="center">Nessuna transazione trovata per i criteri selezionati.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ReportPage;