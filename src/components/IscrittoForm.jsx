// File: src/components/IscrittoForm.jsx

import { useState } from 'react';
import { Box, TextField, Button, Checkbox, FormControlLabel, Grid, Typography, Paper, Collapse, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

// Nuove costanti per Livelli e Categorie (per ginnastica artistica)
const LIVELLI = ['Base', 'Intermedio', 'Avanzato', 'Agonismo'];
const CATEGORIE = ['Microbaby', 'Allieva', 'Junior', 'Senior'];

function IscrittoForm({ onIscrittoAggiunto }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [dataNascita, setDataNascita] = useState('');
  const [luogoNascita, setLuogoNascita] = useState('');
  const [residenza, setResidenza] = useState('');
  const [cap, setCap] = useState('');
  const [via, setVia] = useState('');
  const [numeroCivico, setNumeroCivico] = useState('');
  const [cellulare, setCellulare] = useState('');
  const [email, setEmail] = useState('');
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [codiceAssicurazione, setCodiceAssicurazione] = useState('');
  const [nomeGenitore, setNomeGenitore] = useState('');
  const [cfGenitore, setCfGenitore] = useState('');
  const [annotazioni, setAnnotazioni] = useState('');
  const [haCertificato, setHaCertificato] = useState(false);
  const [scadenzaCertificato, setScadenzaCertificato] = useState('');
  const [scadenzaAbbonamento, setScadenzaAbbonamento] = useState('');
  const [sede, setSede] = useState('Frascati');
  const [quotaIscrizione, setQuotaIscrizione] = useState('');
  const [quotaMensile, setQuotaMensile] = useState('');
  const [livello, setLivello] = useState('');
  const [categoria, setCategoria] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome || !cognome) {
      alert("Inserisci almeno nome e cognome.");
      return;
    }
    const nuovoIscritto = {
      nome, cognome, dataNascita, luogoNascita, residenza, cap, via, numeroCivico,
      cellulare, email, codiceFiscale, codiceAssicurazione, nomeGenitore, cfGenitore, annotazioni,
      sede, quotaIscrizione, quotaMensile,
      livello, categoria, // Nuovi campi
      stato: 'attivo', // Aggiunge lo stato 'attivo' a ogni nuovo iscritto
      certificatoMedico: { presente: haCertificato, scadenza: haCertificato ? scadenzaCertificato : null },
      abbonamento: { scadenza: scadenzaAbbonamento }
    };
    onIscrittoAggiunto(nuovoIscritto);
    
    // Reset di tutti i campi
    setNome(''); setCognome(''); setDataNascita(''); setLuogoNascita('');
    setResidenza(''); setCap(''); setVia(''); setNumeroCivico('');
    setCellulare(''); setEmail(''); setCodiceFiscale(''); setCodiceAssicurazione('');
    setNomeGenitore(''); setCfGenitore(''); setAnnotazioni('');
    setHaCertificato(false); setScadenzaCertificato(''); setScadenzaAbbonamento('');
    setSede('Frascati'); setQuotaIscrizione(''); setQuotaMensile('');
    setLivello(''); setCategoria(''); // Reset Nuovi campi
    setIsOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'background.paper', borderRadius: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>Anagrafica Soci</Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={isOpen ? <CloseIcon /> : <AddCircleOutlineIcon />} 
          onClick={() => setIsOpen(!isOpen)} 
          sx={{ height: '40px', color: 'white' }}
        >
          {isOpen ? 'Chiudi Form Iscrizione' : 'Apri Form Iscrizione'}
        </Button>
      </Box>
      <Collapse in={isOpen}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            {/* Campi Anagrafici Base */}
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Cognome *" value={cognome} onChange={(e) => setCognome(e.target.value)} required /></Grid>
            
            {/* Campi Livello e Categoria (Aumento la larghezza a sm=3 per 4 campi per riga, o 6 per 2 campi, a 12 per 1 campo) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Livello</InputLabel>
                <Select name="livello" label="Livello" value={livello} onChange={(e) => setLivello(e.target.value)}>
                  <MenuItem value=""><em>N/D</em></MenuItem>
                  {LIVELLI.map(lvl => <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Categoria</InputLabel>
                <Select name="categoria" label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <MenuItem value=""><em>N/D</em></MenuItem>
                  {CATEGORIE.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Campi Quota */}
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" name="quotaIscrizione" label="Quota Iscrizione (€)" type="number" value={quotaIscrizione} onChange={(e) => setQuotaIscrizione(e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" name="quotaMensile" label="Quota Mensile Prevista (€)" type="number" value={quotaMensile} onChange={(e) => setQuotaMensile(e.target.value)} /></Grid>

            {/* Dati Nascita/Residenza */}
            <Grid item xs={12} sm={8}><TextField size="small" fullWidth variant="outlined" label="Luogo di Nascita" value={luogoNascita} onChange={(e) => setLuogoNascita(e.target.value)} /></Grid>
            <Grid item xs={12} sm={4}><TextField size="small" fullWidth variant="outlined" label="Data di Nascita" type="date" value={dataNascita} onChange={(e) => setDataNascita(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={9}><TextField size="small" fullWidth variant="outlined" label="Indirizzo (Via / Piazza)" value={via} onChange={(e) => setVia(e.target.value)} /></Grid>
            <Grid item xs={12} sm={3}><TextField size="small" fullWidth variant="outlined" label="N. Civico" value={numeroCivico} onChange={(e) => setNumeroCivico(e.target.value)} /></Grid>
            <Grid item xs={12} sm={9}><TextField size="small" fullWidth variant="outlined" label="Città di Residenza" value={residenza} onChange={(e) => setResidenza(e.target.value)} /></Grid>
            <Grid item xs={12} sm={3}><TextField size="small" fullWidth variant="outlined" label="CAP" value={cap} onChange={(e) => setCap(e.target.value)} /></Grid>
            
            {/* Contatti */}
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Cellulare" value={cellulare} onChange={(e) => setCellulare(e.target.value)} /></Grid>
            
            {/* CF e Assicurazione */}
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Codice Fiscale Atleta" value={codiceFiscale} onChange={(e) => setCodiceFiscale(e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Codice Assicurazione" value={codiceAssicurazione} onChange={(e) => setCodiceAssicurazione(e.target.value)} /></Grid>
            
            {/* Genitore */}
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Cognome e Nome Genitore" value={nomeGenitore} onChange={(e) => setNomeGenitore(e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Codice Fiscale Genitore" value={cfGenitore} onChange={(e) => setCfGenitore(e.target.value)} /></Grid>
            
            {/* Sede e Scadenze */}
            <Grid item xs={12} sm={6}><FormControl fullWidth size="small" variant="outlined"><InputLabel>Sede di Iscrizione</InputLabel><Select name="sede" label="Sede di Iscrizione" value={sede} onChange={(e) => setSede(e.target.value)}><MenuItem value="Frascati">Frascati</MenuItem><MenuItem value="Rocca Priora">Rocca Priora</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Scadenza Primo Abbonamento" type="date" value={scadenzaAbbonamento} onChange={(e) => setScadenzaAbbonamento(e.target.value)} InputLabelProps={{ shrink: true }}/></Grid>
            {haCertificato && (<Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Scadenza Certificato Medico" type="date" value={scadenzaCertificato} onChange={(e) => setScadenzaCertificato(e.target.value)} InputLabelProps={{ shrink: true }}/></Grid>)}
            
            {/* Annotazioni e Checkbox */}
            <Grid item xs={12}><TextField size="small" fullWidth variant="outlined" label="Annotazioni Segreteria" multiline rows={3} value={annotazioni} onChange={(e) => setAnnotazioni(e.target.value)} /></Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Checkbox checked={haCertificato} onChange={(e) => setHaCertificato(e.target.checked)} />} label="Certificato Medico Presente" /></Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} sx={{ height: '40px', color: 'white' }}>Salva Iscrizione</Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}
export default IscrittoForm;