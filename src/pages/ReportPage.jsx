import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../firebase.js';
import { Typography, Grid, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import StatCard from '../components/StatCard.jsx';
import PaidIcon from '@mui/icons-material/Paid';

function ReportPage() {
  const [pagamenti, setPagamenti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPagamenti = async () => {
      try {
        const q = query(collection(db, "pagamenti"), orderBy("dataPagamento", "desc"));
        const querySnapshot = await getDocs(q);
        const pagamentiList = querySnapshot.docs.map(doc => doc.data());
        setPagamenti(pagamentiList);
      } catch (error) {
        console.error("Errore caricamento pagamenti: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPagamenti();
  }, []);

  const stats = useMemo(() => {
    const meseCorrente = new Date().getMonth();
    const annoCorrente = new Date().getFullYear();

    const incassoMese = pagamenti
      .filter(p => new Date(p.dataPagamento).getMonth() === meseCorrente && new Date(p.dataPagamento).getFullYear() === annoCorrente)
      .reduce((sum, p) => sum + p.cifra, 0);

    const incassoFrascati = pagamenti
      .filter(p => p.sede === 'Frascati')
      .reduce((sum, p) => sum + p.cifra, 0);

    const incassoRoccaPriora = pagamenti
      .filter(p => p.sede === 'Rocca Priora')
      .reduce((sum, p) => sum + p.cifra, 0);

    return { incassoMese, incassoFrascati, incassoRoccaPriora };
  }, [pagamenti]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Report Finanziario</Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><StatCard title="Incasso Mese Corrente" value={`${stats.incassoMese.toFixed(2)}€`} icon={<PaidIcon />} color="success.main" /></Grid>
        <Grid item xs={12} md={4}><StatCard title="Incasso Totale Frascati" value={`${stats.incassoFrascati.toFixed(2)}€`} icon={<PaidIcon />} color="info.main" /></Grid>
        <Grid item xs={12} md={4}><StatCard title="Incasso Totale Rocca Priora" value={`${stats.incassoRoccaPriora.toFixed(2)}€`} icon={<PaidIcon />} color="warning.main" /></Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Ultimi Pagamenti Registrati</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Atleta</TableCell>
              <TableCell>Sede</TableCell>
              <TableCell align="right">Importo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagamenti.slice(0, 15).map((p, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(p.dataPagamento).toLocaleDateString('it-IT')}</TableCell>
                <TableCell>{p.iscrittoNome}</TableCell>
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