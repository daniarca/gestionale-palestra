import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../firebase.js';
import {
    Typography, Grid, Box, CircularProgress, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, useTheme, FormControl, Select, MenuItem,
    InputLabel, TextField, InputAdornment, Tabs, Tab, Button, TablePagination
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from '@mui/icons-material/Download';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import PaidIcon from '@mui/icons-material/Paid';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import moment from 'moment';
import { exportToExcel } from '../utils/exportToExcel.js'; // Assicurati che il percorso sia corretto

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

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`report-tabpanel-${index}`} aria-labelledby={`report-tab-${index}`} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function ReportPage() {
  const [pagamenti, setPagamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const anniDisponibili = useMemo(() => generaAnniSportivi(), []);
  const [annoSelezionato, setAnnoSelezionato] = useState(anniDisponibili[1]);
  
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
      setLoading(true);
      try {
        const q = query(collection(db, "pagamenti"), orderBy("dataPagamento", "desc"));
        const querySnapshot = await getDocs(q);
        const pagamentiList = querySnapshot.docs.map(doc => doc.data());
        setPagamenti(pagamentiList);
      } catch (error) { console.error("Errore nel fetch dei pagamenti: ", error); } 
      finally { setLoading(false); }
    };
    fetchPagamenti();
  }, []);

  const stats = useMemo(() => {
    const [startYearStr, endYearStr] = annoSelezionato.split('/');
    const startYear = parseInt(startYearStr);
    
    const inizioAnnoSportivo = moment().year(startYear).month(8).date(1).startOf('day'); 
    const fineAnnoSportivo = moment().year(parseInt(endYearStr)).month(5).date(30).endOf('day'); 

    const pagamentiAnnoSportivo = pagamenti.filter(p => {
        if (!p.dataPagamento) return false;
        const dataPagamento = moment(p.dataPagamento);
        return dataPagamento.isBetween(inizioAnnoSportivo, fineAnnoSportivo, 'day', '[]');
    });

    const incassoPerMese = Array(12).fill(0);
    pagamentiAnnoSportivo.forEach(p => {
      const mese = moment(p.dataPagamento).month();
      incassoPerMese[mese] += p.cifra;
    });

    let datiGraficoBarre = MESI.map((mese, index) => ({ name: mese, Incasso: incassoPerMese[index] }));
    
    const order = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7]; 
    datiGraficoBarre = order.map(i => datiGraficoBarre[i]);

    const incassoPerTipo = pagamentiAnnoSportivo.reduce((acc, p) => {
      const tipo = p.tipo || 'Altro';
      acc[tipo] = (acc[tipo] || 0) + p.cifra;
      return acc;
    }, {});
    const datiGraficoTorta = Object.keys(incassoPerTipo).map(key => ({ name: key, value: incassoPerTipo[key] }));

    const incassoTotaleStorico = pagamenti.reduce((sum, p) => sum + p.cifra, 0);
    const incassoAnnoSelezionato = pagamentiAnnoSportivo.reduce((sum, p) => sum + p.cifra, 0);
    const numTransazioniAnno = pagamentiAnnoSportivo.length;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const transazioniFiltrateUtente = pagamentiAnnoSportivo
        .filter(p => p.iscrittoNome.toLowerCase().includes(lowerSearchTerm));

    return { 
        incassoTotaleStorico, 
        incassoAnnoSelezionato, 
        numTransazioniAnno,
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

  const handleExport = () => {
    if (stats.transazioniFiltrateUtente.length > 0) {
        const dataToExport = stats.transazioniFiltrateUtente.map(p => ({
            'Data': moment(p.dataPagamento).format('DD/MM/YYYY'),
            'Atleta': p.iscrittoNome,
            'Tipo': p.tipo,
            'Sede': p.sede,
            'Importo': p.cifra,
        }));
        exportToExcel(dataToExport, `Report_Pagamenti_${annoSelezionato.replace('/', '-')}`);
    }
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                  <TextField
                      sx={{ flexGrow: 1, minWidth: '250px' }}
                      placeholder="Cerca per nome o cognome del socio..."
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
                  <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExport}
                      disabled={stats.transazioniFiltrateUtente.length === 0}
                  >
                      Esporta in Excel
                  </Button>
              </Box>

              <TableContainer>
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
                          {paginatedTransactions.length > 0 ? (
                              paginatedTransactions.map((p, index) => (
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
                                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
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