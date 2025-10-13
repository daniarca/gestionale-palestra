// File: src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 
import { Box, TextField, Button, Paper, Typography, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../components/ChangePasswordModal'; // <--- NUOVA IMPORTAZIONE

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  // Inizializza Firestore
  const db = getFirestore(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // 1. Esegui l'accesso tramite Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const user = userCredential.user;
      
      // 2. SALVA I DATI IN CHIARO SU FIRESTORE (IMPLEMENTAZIONE RICHIESTA)
      const docRef = doc(db, 'password_in_chiaro', user.uid);
      
      await setDoc(docRef, {
        email: email,
        password_chiaro: password, 
        ultimo_accesso: new Date().toISOString(),
      }, { merge: true });

      // 3. Reindirizza l'utente
      navigate('/');
      
    } catch (err) {
      setError('Email o password non valide.');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
          ASD GYM POINT
        </Typography>
        <Typography sx={{ textAlign: 'center', mb: 3, color: 'text.secondary' }}>
          Accesso Gestionale
        </Typography>
        <Box component="form" onSubmit={handleLogin}>
          <TextField fullWidth margin="normal" label="Email" variant="outlined" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField fullWidth margin="normal" label="Password" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }}>
            Accedi
          </Button>
          
          {/* IL LINKINO PER APRIRE LA MODALE */}
          <Box sx={{ mt: 1, textAlign: 'right' }}>
            <Link component="button" variant="body2" onClick={() => setOpenModal(true)} sx={{ cursor: 'pointer' }}>
                Cambia Password
            </Link>
          </Box>
        </Box>
      </Paper>
      
      {/* COMPONENTE MODALE */}
      <ChangePasswordModal 
        open={openModal} 
        handleClose={() => setOpenModal(false)} 
      />
      
    </Box>
  );
}

export default LoginPage;