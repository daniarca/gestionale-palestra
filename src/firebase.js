// File: src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// La configurazione con il nome del bucket corretto
const firebaseConfig = {
  apiKey: "AIzaSyD1HBvHLoEoR1_8ZNMT2ZnPUDIDrWBmQ3I",
  authDomain: "gestionale-palestra-aaa1c.firebaseapp.com",
  projectId: "gestionale-palestra-aaa1c",
  // --- CORREZIONE QUI ---
  // Questo è il nome corretto del bucket che Firebase ha creato
  storageBucket: "gestionale-palestra-aaa1c.firebasestorage.app",
  messagingSenderId: "1026742106024",
  appId: "1:1026742106024:web:83453ad3c675cd72facf9d",
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza e esporta i singoli servizi
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
