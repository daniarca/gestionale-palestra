// File: src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Box, TextField, Button, Paper, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;