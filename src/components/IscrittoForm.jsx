// File: src/components/IscrittoForm.jsx

import { useState } from 'react';
import { Box, TextField, Button, Checkbox, FormControlLabel, Grid, Typography, Divider, MenuItem, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// Nuove costanti per Livelli e Categorie (per ginnastica artistica)
const LIVELLI = ['Base', 'Intermedio', 'Avanzato', 'Agonismo'];
const CATEGORIE = ['Microbaby', 'Allieva', 'Junior', 'Senior'];

// Il componente ora riceve i props per la gestione del Dialog
function IscrittoForm({ open, onClose, onIscrittoAggiunto }) {
  
  // STATI DEL FORM
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


  const resetForm = () => {
    setNome(''); setCognome(''); setDataNascita(''); setLuogoNascita('');
    setResidenza(''); setCap(''); setVia(''); setNumeroCivico('');
    setCellulare(''); setEmail(''); setCodiceFiscale(''); setCodiceAssicurazione('');
    setNomeGenitore(''); setCfGenitore(''); setAnnotazioni('');
    setHaCertificato(false); setScadenzaCertificato(''); setScadenzaAbbonamento('');
    setSede('Frascati'); setQuotaIscrizione(''); setQuotaMensile('');
    setLivello(''); setCategoria('');
    onClose(); // Chiude il Dialog
  };


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
      livello, categoria, 
      stato: 'attivo', 
      dataIscrizione: new Date().toISOString().split('T')[0], // Aggiunge la data di iscrizione
      certificatoMedico: { presente: haCertificato, scadenza: haCertificato ? scadenzaCertificato : null },
      abbonamento: { scadenza: scadenzaAbbonamento }
    };
    onIscrittoAggiunto(nuovoIscritto);
    
    // Resetta e chiude
    resetForm();
  };
  
  // Usiamo una funzione separata per la chiusura del form senza reset dei dati (Annulla)
  const handleClose = () => {
      onClose(); 
  };


  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Nuova Iscrizione Socio</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
            <DialogContent>
                <Grid container spacing={3} sx={{ pt: 1 }}>
                    
                    {/* 1. SEZIONE ANAGRAFICA BASE */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Dati Anagrafici Base</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required /></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Cognome *" value={cognome} onChange={(e) => setCognome(e.target.value)} required /></Grid>
                            <Grid item xs={12} sm={8}><TextField size="small" fullWidth variant="outlined" label="Luogo di Nascita" value={luogoNascita} onChange={(e) => setLuogoNascita(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={4}><TextField size="small" fullWidth variant="outlined" label="Data di Nascita" type="date" value={dataNascita} onChange={(e) => setDataNascita(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Codice Fiscale Atleta" value={codiceFiscale} onChange={(e) => setCodiceFiscale(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Codice Assicurazione" value={codiceAssicurazione} onChange={(e) => setCodiceAssicurazione(e.target.value)} /></Grid>
                        </Grid>
                    </Grid>

                    {/* 2. SEZIONE INDIRIZZO E CONTATTI */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Indirizzo e Contatti</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={9}><TextField size="small" fullWidth variant="outlined" label="Indirizzo (Via / Piazza)" value={via} onChange={(e) => setVia(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={3}><TextField size="small" fullWidth variant="outlined" label="N. Civico" value={numeroCivico} onChange={(e) => setNumeroCivico(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={9}><TextField size="small" fullWidth variant="outlined" label="Città di Residenza" value={residenza} onChange={(e) => setResidenza(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={3}><TextField size="small" fullWidth variant="outlined" label="CAP" value={cap} onChange={(e) => setCap(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Cellulare" value={cellulare} onChange={(e) => setCellulare(e.target.value)} /></Grid>
                        </Grid>
                    </Grid>

                    {/* 3. SEZIONE GRUPPO E LIVELLO */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Dati Tecnici e Quote</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            
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

                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" name="quotaIscrizione" label="Quota Iscrizione (€)" type="number" value={quotaIscrizione} onChange={(e) => setQuotaIscrizione(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" name="quotaMensile" label="Quota Mensile Prevista (€)" type="number" value={quotaMensile} onChange={(e) => setQuotaMensile(e.target.value)} /></Grid>
                            
                            <Grid item xs={12} sm={6}><FormControl fullWidth size="small" variant="outlined"><InputLabel>Sede di Iscrizione</InputLabel><Select name="sede" label="Sede di Iscrizione" value={sede} onChange={(e) => setSede(e.target.value)}><MenuItem value="Frascati">Frascati</MenuItem><MenuItem value="Rocca Priora">Rocca Priora</MenuItem></Select></FormControl></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Scadenza Primo Abbonamento" type="date" value={scadenzaAbbonamento} onChange={(e) => setScadenzaAbbonamento(e.target.value)} InputLabelProps={{ shrink: true }}/></Grid>
                        </Grid>
                    </Grid>

                    {/* 4. SEZIONE CERTIFICATO E NOTE */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Certificato e Annotazioni</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} sx={{ display: 'flex' }}><FormControlLabel control={<Checkbox checked={haCertificato} onChange={(e) => setHaCertificato(e.target.checked)} />} label="Certificato Medico Presente" /></Grid>
                            {haCertificato && (<Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Scadenza Certificato Medico" type="date" value={scadenzaCertificato} onChange={(e) => setScadenzaCertificato(e.target.value)} InputLabelProps={{ shrink: true }}/></Grid>)}
                            <Grid item xs={12}><TextField size="small" fullWidth variant="outlined" label="Annotazioni Segreteria" multiline rows={3} value={annotazioni} onChange={(e) => setAnnotazioni(e.target.value)} /></Grid>
                        </Grid>
                    </Grid>
                    
                    {/* 5. SEZIONE DATI GENITORE (Se Minore) */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Dati Genitore/Responsabile</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Cognome e Nome Genitore" value={nomeGenitore} onChange={(e) => setNomeGenitore(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6}><TextField size="small" fullWidth variant="outlined" label="Codice Fiscale Genitore" value={cfGenitore} onChange={(e) => setCfGenitore(e.target.value)} /></Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose}>Annulla</Button>
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />} 
                    sx={{ height: '40px', color: 'white' }} 
                >
                    Salva Iscrizione
                </Button>
            </DialogActions>
        </Box>
    </Dialog>
  );
}
export default IscrittoForm;