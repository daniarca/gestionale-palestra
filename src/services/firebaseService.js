// File: src/services/firebaseService.js (Nuovo File)

import { collection, getDocs, query, where, doc, updateDoc, addDoc, deleteDoc, orderBy } from "firebase/firestore"; 
import { db } from '../firebase.js';

// --- SERVIZI PER ISCRITTI ---

export const fetchIscrittiAttivi = async () => {
  const q = query(collection(db, "iscritti"), where("stato", "==", "attivo"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchIscrittiArchiviati = async () => {
  const q = query(collection(db, "iscritti"), where("stato", "==", "archiviato"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addIscritto = async (nuovoIscritto) => {
  const docRef = await addDoc(collection(db, "iscritti"), nuovoIscritto);
  return { id: docRef.id, ...nuovoIscritto };
};

export const updateIscritto = async (updatedData) => {
  const iscrittoRef = doc(db, "iscritti", updatedData.id);
  await updateDoc(iscrittoRef, updatedData);
};

export const archiviaIscritto = async (id) => {
  const iscrittoRef = doc(db, "iscritti", id);
  await updateDoc(iscrittoRef, { stato: "archiviato" });
};

export const ripristinaIscritto = async (id) => {
  const iscrittoRef = doc(db, "iscritti", id);
  await updateDoc(iscrittoRef, { stato: "attivo" });
};

export const deleteIscritto = async (id) => {
  await deleteDoc(doc(db, "iscritti", id));
};


// --- SERVIZI PER PAGAMENTI ---

export const fetchPagamentiByIscrittoId = async (iscrittoId) => {
  const q = query(collection(db, "pagamenti"), where("iscrittoId", "==", iscrittoId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const fetchAllPagamenti = async () => {
  const q = query(collection(db, "pagamenti"), orderBy("dataPagamento", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const addPagamento = async (nuovoPagamento) => {
  await addDoc(collection(db, "pagamenti"), nuovoPagamento);
};


// --- SERVIZI PER GRUPPI ---

export const fetchGruppi = async () => {
  const q = query(collection(db, "gruppi"), orderBy("nome"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addGruppo = async (nuovoGruppo) => {
  await addDoc(collection(db, "gruppi"), nuovoGruppo);
};

export const updateGruppoMembri = async (gruppoId, nuoviMembriIds) => {
  const gruppoRef = doc(db, "gruppi", gruppoId);
  await updateDoc(gruppoRef, { membri: nuoviMembriIds });
};

export const deleteGruppo = async (id) => {
  await deleteDoc(doc(db, "gruppi", id));
};


// --- SERVIZI PER STAFF ---

export const fetchStaff = async () => {
  const q = query(collection(db, "staff"), orderBy("cognome"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addStaff = async (nuovoMembro) => {
  await addDoc(collection(db, "staff"), nuovoMembro);
};

export const deleteStaff = async (id) => {
  await deleteDoc(doc(db, "staff", id));
};