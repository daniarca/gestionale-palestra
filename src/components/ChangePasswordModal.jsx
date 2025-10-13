// File: src/components/ChangePasswordModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    getAuth, 
    EmailAuthProvider, 
    reauthenticateWithCredential, 
    updatePassword 
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 
import { Modal, Box, TextField, Button, Typography, Alert } from '@mui/material';

// Stile per la Modale
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

function ChangePasswordModal({ open, handleClose }) {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    // Inizializza gli stati per la modale
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Al cambio di stato della modale, resetta i messaggi e l'email
    useEffect(() => {
        if (open) {
            setError('');
            setSuccess('');
            if (user) {
                setEmail(user.email);
            } else {
                setEmail('');
            }
        }
    }, [open, user]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user || user.email !== email) {
            setError("L'email non corrisponde all'utente loggato. Effettua prima l'accesso.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La nuova password deve contenere almeno 6 caratteri.");
            return;
        }
        
        // 1. Crea la credenziale con la VECCHIA password
        const credential = EmailAuthProvider.credential(user.email, oldPassword);

        try {
            // 2. Ri-autentica l'utente (verifica la vecchia password)
            await reauthenticateWithCredential(user, credential);
            
            // 3. Aggiorna la password in Firebase Auth
            await updatePassword(user, newPassword);

            // 4. Aggiorna la password in chiaro (richiesta per la tua implementazione di test)
            const docRef = doc(db, 'password_in_chiaro', user.uid);
            await setDoc(docRef, {
                password_chiaro: newPassword, 
                data_cambio: new Date().toISOString(),
            }, { merge: true });

            setSuccess("Password cambiata con successo!");
            setOldPassword('');
            setNewPassword('');
            
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError("La vecchia password non è corretta.");
            } else if (err.code === 'auth/weak-password') {
                setError("La nuova password è troppo debole.");
            } else if (err.code === 'auth/requires-recent-login') {
                setError("Sessione scaduta. Riprova l'accesso prima di cambiare la password.");
            } else {
                setError(`Errore: ${err.message}`);
            }
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Cambia Password
                </Typography>

                <TextField fullWidth margin="normal" label="Email" variant="outlined" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!user} helperText={user ? `Utente loggato: ${user.email}` : "Inserisci la tua email"} />
                <TextField fullWidth margin="normal" label="Vecchia Password" variant="outlined" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                <TextField fullWidth margin="normal" label="Nuova Password" variant="outlined" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                    Conferma
                </Button>
                <Button fullWidth variant="text" onClick={handleClose} sx={{ mt: 1 }}>
                    Annulla
                </Button>
            </Box>
        </Modal>
    );
}

export default ChangePasswordModal;