import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../firebase.js';
import { Typography, Grid, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import PaidIcon from '@mui/icons-material/Paid';

const MESI = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const COLORS = ['#A78BFA', '#89B4FA', '#FAB387', '#A6E3A1'];

function ReportPage() {
  const [pagamenti, setPagamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

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
    const annoCorrente = new Date().getFullYear();
    const pagamentiAnnoCorrente = pagamenti.filter(p => new Date(p.dataPagamento).getFullYear() === annoCorrente);

    const incassoPerMese = Array(12).fill(0);
    pagamentiAnnoCorrente.forEach(p => {
      const mese = new Date(p.dataPagamento).getMonth();
      incassoPerMese[mese] += p.cifra;
    });
    const datiGraficoBarre = MESI.map((mese, index) => ({ name: mese, Incasso: incassoPerMese[index] }));

    const incassoPerSede = pagamenti.reduce((acc, p) => {
      const sede = p.sede || 'Non specificata';
      acc[sede] = (acc[sede] || 0) + p.cifra;
      return acc;
    }, {});
    const datiGraficoTorta = Object.keys(incassoPerSede).map(key => ({ name: key, value: incassoPerSede[key] }));
    
    const incassoTotale = pagamenti.reduce((sum, p) => sum + p.cifra, 0);

    return { incassoTotale, datiGraficoBarre, datiGraficoTorta };
  }, [pagamenti]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Report Finanziario</Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <StatCard title="Incasso Totale Complessivo" value={`${stats.incassoTotale.toFixed(2)}€`} icon={<PaidIcon />} color={theme.palette.success.main} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 4, height: 300 }}>
            <Typography variant="h6">Incassi Mensili (Anno Corrente)</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.datiGraficoBarre} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }}/>
                <Bar dataKey="Incasso" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 4, height: 300 }}>
            <Typography variant="h6">Divisione per Sede</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.datiGraficoTorta} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.datiGraficoTorta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Ultime Transazioni</Typography>
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
            {pagamenti.slice(0, 10).map((p, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{new Date(p.dataPagamento).toLocaleDateString('it-IT')}</TableCell>
                <TableCell>{p.iscrittoNome}</TableCell>
                <TableCell>{p.tipo}</TableCell>
                <TableCell>{p.sede}</TableCell>
                <TableCell align="right">{p.cifra.toFixed(2)}€</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ReportPage;