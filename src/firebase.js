import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1HBvHLoEoR1_8ZNMT2ZnPUDIDrWBmQ3I",
  authDomain: "gestionale-palestra-aaa1c.firebaseapp.com",
  projectId: "gestionale-palestra-aaa1c",
  storageBucket: "gestionale-palestra-aaa1c.firebasestorage.app",
  messagingSenderId: "1026742106024",
  appId: "1:1026742106024:web:83453ad3c675cd72facf9d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. QUESTE DUE RIGHE MANCAVANO: Inizializzano il database e lo rendono pubblico
//    con la parola "export"
export const db = getFirestore(app);