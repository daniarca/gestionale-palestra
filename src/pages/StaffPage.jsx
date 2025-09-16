import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore"; 
import { db } from '../firebase.js';
import { Typography, Box, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, Divider, Grid, Collapse, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [ruolo, setRuolo] = useState('Allenatore');

  const fetchStaff = async () => {
    try {
      const q = query(collection(db, "staff"), orderBy("cognome"));
      const querySnapshot = await getDocs(q);
      const staffList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(staffList);
    } catch (error) { console.error("Errore caricamento staff: ", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreaMembro = async (e) => {
    e.preventDefault();
    if (!nome || !cognome) { return; }
    try {
      await addDoc(collection(db, "staff"), { nome, cognome, ruolo });
      setNome('');
      setCognome('');
      setRuolo('Allenatore');
      setFormOpen(false);
      fetchStaff();
    } catch (error) { console.error("Errore creazione membro staff:", error); }
  };

  const handleEliminaMembro = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare?")) return;
    try {
      await deleteDoc(doc(db, "staff", id));
      fetchStaff();
    } catch (error) { console.error("Errore eliminazione:", error); }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'background.paper', borderRadius: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>Gestione Staff</Typography>
          <Button variant="contained" startIcon={formOpen ? <CloseIcon /> : <AddCircleOutlineIcon />} onClick={() => setFormOpen(!formOpen)} sx={{ height: '40px' }}>
            {formOpen ? 'Chiudi Form' : 'Aggiungi Membro'}
          </Button>
        </Box>
        <Collapse in={formOpen}>
          <Box component="form" onSubmit={handleCreaMembro} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Nuovo Membro Staff</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}><TextField size="small" fullWidth variant="outlined" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} /></Grid>
              <Grid item xs={12} sm={5}><TextField size="small" fullWidth variant="outlined" label="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} /></Grid>
              <Grid item xs={12} sm={2}><FormControl fullWidth size="small" variant="outlined"><InputLabel>Ruolo</InputLabel><Select label="Ruolo" value={ruolo} onChange={(e) => setRuolo(e.target.value)}><MenuItem value="Allenatore">Allenatore</MenuItem><MenuItem value="Segreteria">Segreteria</MenuItem></Select></FormControl></Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}><Button type="submit" variant="contained" sx={{ height: '40px' }}>Salva Membro</Button></Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <Typography variant="h6" gutterBottom>Elenco Staff ({staff.length})</Typography>
        <List>
          {staff.map((membro, index) => (
            <React.Fragment key={membro.id}>
              <ListItem secondaryAction={<IconButton edge="end" onClick={() => handleEliminaMembro(membro.id)}><DeleteIcon color="error" /></IconButton>}>
                <ListItemText primary={`${membro.cognome} ${membro.nome}`} secondary={membro.ruolo} />
              </ListItem>
              {index < staff.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default StaffPage;