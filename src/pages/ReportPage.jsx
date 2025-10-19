// File: src/pages/ReportPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../firebase.js';
import {
    Typography, Grid, Box, CircularProgress, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, useTheme, FormControl, Select, MenuItem,
    InputLabel, TextField, InputAdornment, Tabs, Tab, Button, TablePagination, IconButton
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { deletePayment } from '../firebase.js';
import StatCard from '../components/StatCard.jsx';
import PaidIcon from '@mui/icons-material/Paid';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import moment from 'moment';
import { exportToExcel } from '../utils/exportToExcel.js';
import { useNotification } from '../context/NotificationContext.jsx'; // Importa useNotification

// Mesi in Italiano abbreviati per le colonne del report
const MESI = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
// Colori per il Pie Chart (rilevanti dal tema)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


const generaAnniSportivi = (numAnni = 3) => {
    const annoCorrente = new Date().getFullYear();
    const meseCorrente = new Date().getMonth();
    const annoInizioCorrente = meseCorrente < 8 ? annoCorrente - 1 : annoCorrente;
    
    const anni = [];
    for (let i = 0; i < numAnni; i++) {
        const annoInizio = annoInizioCorrente - i;
        anni.push(`${annoInizio}/${annoInizio + 1}`);
    }
    return anni.reverse(); // Returns sorted from old to new
};

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`report-tabpanel-${index}`} aria-labelledby={`report-tab-${index}`} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// AGGIUNGI iscrittiList TRA I PROPS
function ReportPage({ pagamentiList, iscrittiList = [] }) {
  const [pagamenti, setPagamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const { showNotification } = useNotification(); // Usa useNotification
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  const anniDisponibili = useMemo(() => generaAnniSportivi(5), []); // Genera più anni per una migliore selezione
  // FIX: Imposta l'anno corrente (l'ultimo dell'array) come default
  const [annoSelezionato, setAnnoSelezionato] = useState(anniDisponibili[anniDisponibili.length - 1]); 

  // Usa i dati passati come prop per evitare fetch non necessarie e gestire il loading
  useEffect(() => {
    setPagamenti(pagamentiList);
    setLoading(false);
  }, [pagamentiList]);

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo pagamento? L\'azione è irreversibile.')) {
      return;
    }
    setDeletingId(paymentId);
    try {
      await deletePayment('pagamenti', paymentId);
      showNotification('Pagamento eliminato con successo!', 'success');
      // Workaround to refresh data, since ReportPage doesn't own the fetching logic.
      // A better approach would be to lift the state up or use a global state management library.
      window.location.reload();
    } catch (error) {
      console.error("Errore durante l'eliminazione del pagamento:", error);
      showNotification(error.message || 'Si è verificato un errore durante l\'eliminazione.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    if (!pagamenti.length) return {
        incassoTotaleStorico: 0,
        incassoAnnoSelezionato: 0,
        numTransazioniAnno: 0,
        incassoBonifico: 0, 
        incassoContanti: 0,
        datiGraficoBarre: [],
        datiGraficoTorta: [],
        transazioniFiltrateUtente: [],
    };
    
    const [startYearStr, endYearStr] = annoSelezionato.split('/');
    const startYear = parseInt(startYearStr);
    
    // Anno sportivo va da Settembre (mese 8) dell'anno di inizio a Giugno (mese 5) dell'anno di fine
    const inizioAnnoSportivo = moment().year(startYear).month(8).date(1).startOf('day'); 
    const fineAnnoSportivo = moment().year(parseInt(endYearStr)).month(5).date(30).endOf('day'); 

    const inizioPeriodoIscrizioni = inizioAnnoSportivo.clone().subtract(2, 'months');

    const pagamentiAnnoSportivo = pagamenti.filter(p => {
        if (!p.dataPagamento) return false;
        const dataPagamento = moment(p.dataPagamento);

        const isIscrizione = p.tipo && (p.tipo.toLowerCase().includes('iscrizione') || p.tipo.toLowerCase().includes('annuale'));

        if (isIscrizione) {
            return dataPagamento.isBetween(inizioPeriodoIscrizioni, fineAnnoSportivo, 'day', '[]');
        }

        return dataPagamento.isBetween(inizioAnnoSportivo, fineAnnoSportivo, 'day', '[]');
    });

    // Aggregazione
    let incassoTotale = 0;
    let incassoBonifico = 0;
    let incassoContanti = 0;
    const incassoPerMeseMap = Array(12).fill(0); // 0-11 per Gen-Dic
    const incassoPerTipoMap = {};

    pagamentiAnnoSportivo.forEach(p => {
        const cifra = Number(p.cifra) || 0; // FIX: Conversione esplicita a Number
        incassoTotale += cifra;

        // Aggregazione per metodo di pagamento
        if (p.metodoPagamento === 'Bonifico') {
            incassoBonifico += cifra;
        } else {
            incassoContanti += cifra; // Contanti o N/D
        }
        
        if (p.dataPagamento) {
            const mese = moment(p.dataPagamento).month();
            incassoPerMeseMap[mese] += cifra;
        }
        
        const tipo = p.tipo || 'Altro';
        incassoPerTipoMap[tipo] = (incassoPerTipoMap[tipo] || 0) + cifra;
    });

    const incassoAnnoSelezionato = incassoTotale;
    const numTransazioniAnno = pagamentiAnnoSportivo.length;
    
    // Dati Grafico Barre (Ordiniamo Set-Giu)
    const mesiAnnoSportivo = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
    const datiGraficoBarre = mesiAnnoSportivo.map(monthIndex => ({
        name: MESI[monthIndex],
        Incasso: incassoPerMeseMap[monthIndex]
    }));

    const datiGraficoTorta = Object.keys(incassoPerTipoMap).map(key => ({ 
        name: key, 
        value: incassoPerTipoMap[key] 
    }));

    const lowerSearchTerm = searchTerm.toLowerCase();
    const transazioniFiltrateUtente = pagamentiAnnoSportivo
        .filter(p => p.iscrittoNome.toLowerCase().includes(lowerSearchTerm) || (p.metodoPagamento || '').toLowerCase().includes(lowerSearchTerm))
        .sort((a, b) => moment(b.dataPagamento).valueOf() - moment(a.dataPagamento).valueOf());

    return { 
        incassoTotaleStorico: pagamenti.reduce((sum, p) => sum + (Number(p.cifra) || 0), 0),
        incassoAnnoSelezionato, 
        numTransazioniAnno,
        incassoBonifico,
        incassoContanti,
        datiGraficoBarre, 
        datiGraficoTorta,
        transazioniFiltrateUtente,
    };
  }, [pagamenti, annoSelezionato, searchTerm]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportTransactions = () => {
    if (stats.transazioniFiltrateUtente.length > 0) {
        const dataToExport = stats.transazioniFiltrateUtente.map(p => ({
            'Data': moment(p.dataPagamento).format('DD/MM/YYYY'),
            'Atleta': p.iscrittoNome,
            'Tipo': p.tipo,
            'Metodo': p.metodoPagamento || 'N/D',
            'Sede': p.sede,
            'Importo': p.cifra,
        }));
        exportToExcel(dataToExport, `Report_Transazioni_${annoSelezionato.replace('/', '-')}`, true);
        showNotification("Report Transazioni esportato in Excel!", "success");
    } else {
         showNotification("Nessuna transazione da esportare.", "warning");
    }
  };

  // NUOVA FUNZIONE PER L'EXPORT BONIFICO (MATRICE)
  const handleExportBonifico = () => {
    if (iscrittiList.length === 0 || pagamenti.length === 0) {
        showNotification("Dati insufficienti per il report bonifici.", "warning");
        return;
    }

    const [startYearStr, endYearStr] = annoSelezionato.split('/');
    const startYear = parseInt(startYearStr);
    
    // Colonne del report a matrice (Iscrizione + Mesi dell'anno sportivo)
    const colonneMesi = ["Iscrizione", ...MESI.slice(8), ...MESI.slice(0, 6)]; // Iscrizione, Set, Ott, ..., Giu

    // 1. Filtra solo i pagamenti dell'anno sportivo selezionato E con metodo Bonifico
    const pagamentiBonifico = pagamenti.filter(p => {
        if (p.metodoPagamento !== 'Bonifico') return false; 
        if (!p.dataPagamento) return false;
        
        const dataPagamento = moment(p.dataPagamento);
        const annoPagamento = dataPagamento.year();
        const mesePagamento = dataPagamento.month();

        // Controllo l'anno sportivo (dal mese 8 dell'anno di inizio al mese 5 dell'anno di fine)
        const isSettembreDicembre = mesePagamento >= 8 && mesePagamento <= 11 && annoPagamento === startYear;
        const isGennaioGiugno = mesePagamento >= 0 && mesePagamento <= 5 && annoPagamento === parseInt(endYearStr);

        // La logica si basa sul mese di riferimento (meseRiferimento) PER CAPIRE A QUALE ANNO SPETTA
        // Ma, come scoperto, il filtro deve usare la data di pagamento (dataPagamento).
        // Se il filtro per data di pagamento (isBetween inizio e fine anno sportivo) è soddisfatto,
        // E il metodo è Bonifico, allora il pagamento è da includere.

        // Per il report a matrice, la logica deve includere i pagamenti la cui data di pagamento ricade
        // nell'anno sportivo corretto *oppure* sono pagamenti anticipati per mesi dell'anno sportivo.
        // Manteniamo la logica semplice: l'aggregazione per colonna (Dic) risolve il problema.
        
        // Usiamo la stessa logica di data per la coerenza del report: solo pagamenti la cui data ricade nell'anno sportivo.
        const inizioAnnoSportivo = moment().year(startYear).month(8).date(1).startOf('day'); 
        const fineAnnoSportivo = moment().year(parseInt(endYearStr)).month(5).date(30).endOf('day'); 
        
        return dataPagamento.isBetween(inizioAnnoSportivo, fineAnnoSportivo, 'day', '[]');
    });

    // 2. Aggrega i pagamenti per iscritto e per colonna (Mese/Iscrizione)
    const datiAggregati = {};
    pagamentiBonifico.forEach(p => {
        const iscrittoId = p.iscrittoId;
        const tipoPagamento = p.tipo || ''; 
        let colonna = '';
        const cifra = Number(p.cifra) || 0; // FIX: Conversione esplicita a Number

        if (tipoPagamento.toLowerCase().includes('iscrizione')) {
            colonna = 'Iscrizione';
        } else if (tipoPagamento.toLowerCase().includes('mensile') && p.meseRiferimento != null) {
            colonna = MESI[p.meseRiferimento];
        } else {
             return; 
        }

        if (!datiAggregati[iscrittoId]) {
            datiAggregati[iscrittoId] = {
                iscrittoNome: p.iscrittoNome,
                ...colonneMesi.reduce((acc, mese) => ({...acc, [mese]: 0}), {})
            };
        }
        
        // Somma le cifre per la colonna
        datiAggregati[iscrittoId][colonna] += cifra;
    });

    // 3. Crea il Report Finale con tutti gli iscritti (attivi + archiviati)
    const reportFinale = iscrittiList
        .sort((a, b) => a.cognome.localeCompare(b.cognome))
        .map(iscritto => {
            const rowData = datiAggregati[iscritto.id] || {};
            
            // Calcola il totale bonifico per l'anno sportivo
            const totaleBonifico = colonneMesi.reduce((sum, col) => sum + (rowData[col] || 0), 0);
            
            // Crea la riga del report formattata per l'export
            const formattedRow = {
                'COGNOME': iscritto.cognome,
                'NOME': iscritto.nome,
                // Aggiunge le colonne Iscrizione e Mesi con i totali
                ...colonneMesi.reduce((acc, mese) => ({
                    ...acc,
                    [mese]: rowData[mese] ? rowData[mese].toFixed(2) : 0, 
                }), {}),
                'TOTALE BONIFICO': totaleBonifico.toFixed(2)
            };
            
            return formattedRow;
        });


    if (reportFinale.length === 0) {
        showNotification("Nessun iscritto trovato per la lista.", "warning");
        return;
    }
    
    exportToExcel(reportFinale, `Report_Bonifici_Matrix_${annoSelezionato.replace('/', '-')}`, true);
    showNotification("Report Bonifici esportato in Excel!", "success");
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }
  
  const paginatedTransactions = stats.transazioniFiltrateUtente.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Report Finanziario</Typography>
      
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
              <Tab label="Panoramica" id="report-tab-0" />
              <Tab label="Elenco Transazioni" id="report-tab-1" />
          </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
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
                title={`Incasso Bonifico ${annoSelezionato}`} 
                value={`${stats.incassoBonifico.toFixed(2)}€`} 
                icon={<AttachMoneyIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard 
                title={`Incasso Contanti ${annoSelezionato}`} 
                value={`${stats.incassoContanti.toFixed(2)}€`} 
                icon={<ReceiptIcon />} 
                color={theme.palette.warning.main} 
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}€`, 'Importo']}/>
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                  <TextField
                      sx={{ flexGrow: 1, minWidth: '250px' }}
                      placeholder="Cerca per nome, tipo o metodo di pagamento..."
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportTransactions}
                        disabled={stats.transazioniFiltrateUtente.length === 0}
                    >
                        Esporta Transazioni (Lista)
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportBonifico}
                        disabled={iscrittiList.length === 0}
                    >
                        Export Bonifico (Matrice)
                    </Button>
                  </Box>
              </Box>

              <TableContainer>
                  <Table>
                      <TableHead>
                          <TableRow>
                              <TableCell>Data</TableCell>
                              <TableCell>Atleta</TableCell>
                              <TableCell>Tipo</TableCell>
                              <TableCell>Sede</TableCell>
                              <TableCell>Metodo</TableCell> {/* NUOVA COLONNA */}
                              <TableCell align="right">Importo</TableCell>
                              <TableCell align="center">Azioni</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {paginatedTransactions.length > 0 ? (
                              paginatedTransactions.map((p, index) => (
                                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell>{moment(p.dataPagamento).format('DD/MM/YYYY')}</TableCell>
                                      <TableCell>{p.iscrittoNome}</TableCell>
                                      <TableCell>{p.tipo}</TableCell>
                                      <TableCell>{p.sede}</TableCell>
                                      <TableCell>{p.metodoPagamento || 'N/D'}</TableCell> {/* NUOVA CELLA */}
                                      <TableCell align="right">{Number(p.cifra).toFixed(2)}€</TableCell>
                                      <TableCell align="center">
                                        <IconButton
                                          aria-label="delete"
                                          size="small"
                                          onClick={() => handleDeletePayment(p.id)}
                                          disabled={deletingId === p.id}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                      <Typography color="text.secondary">
                                          Nessuna transazione trovata per i criteri selezionati.
                                      </Typography>
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </TableContainer>
              <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={stats.transazioniFiltrateUtente.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Righe per pagina:"
              />
          </Paper>
      </TabPanel>
    </Box>
  );
}

export default ReportPage;