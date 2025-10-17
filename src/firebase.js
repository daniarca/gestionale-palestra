// File: src/firebase.js

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  deleteObject,
} from "firebase/storage";

// Configurazione Firebase originale
const firebaseConfig = {
  apiKey: "AIzaSyD1HBvHLoEoR1_8ZNMT2ZnPUDIDrWBmQ3I",
  authDomain: "gestionale-palestra-aaa1c.firebaseapp.com",
  projectId: "gestionale-palestra-aaa1c",
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

/**
 * 🔥 Cancella un pagamento dal Firestore e (se esiste) la ricevuta dal Cloud Storage.
 *
 * @param {string} collectionName - Nome della collection (es. "pagamenti" o "payments").
 * @param {string} paymentId - ID del documento del pagamento da eliminare.
 * @returns {Promise<void>}
 */
export async function deletePayment(collectionName, paymentId) {
  if (!collectionName || !paymentId) {
    throw new Error("deletePayment: collectionName e paymentId sono obbligatori");
  }

  const paymentRef = doc(db, collectionName, paymentId);

  // Leggiamo il documento per vedere se contiene riferimenti a file storage
  const snap = await getDoc(paymentRef);
  if (!snap.exists()) {
    throw new Error(`Pagamento ${paymentId} non trovato in ${collectionName}`);
  }

  const data = snap.data();

  try {
    // Se il documento contiene un campo con il percorso della ricevuta, eliminiamo anche quello
    if (data.receiptPath) {
      const fileRef = storageRef(storage, data.receiptPath);
      await deleteObject(fileRef).catch((err) =>
        console.warn("Errore eliminazione file receiptPath:", err.message)
      );
    } else if (data.receiptUrl) {
      // Se invece c'è una URL pubblica, proviamo a ricavare il path
      const match = /\/o\/([^?]+)/.exec(data.receiptUrl);
      if (match && match[1]) {
        const decodedPath = decodeURIComponent(match[1]);
        const fileRef = storageRef(storage, decodedPath);
        await deleteObject(fileRef).catch((err) =>
          console.warn("Errore eliminazione file receiptUrl:", err.message)
        );
      }
    }
  } catch (e) {
    console.warn("Errore durante la cancellazione file ricevuta (non bloccante):", e);
  }

  // Infine cancelliamo il documento Firestore
  await deleteDoc(paymentRef);
  console.log(`Pagamento ${paymentId} eliminato da ${collectionName}`);
}
