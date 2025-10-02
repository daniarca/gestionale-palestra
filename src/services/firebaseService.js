// File: src/services/firebaseService.js

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase.js";

// --- SERVIZI PER ISCRITTI ---
export const fetchIscrittiAttivi = async () => {
  const q = query(collection(db, "iscritti"), where("stato", "==", "attivo"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
export const fetchIscrittiArchiviati = async () => {
  const q = query(
    collection(db, "iscritti"),
    where("stato", "==", "archiviato")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
  const q = query(
    collection(db, "pagamenti"),
    where("iscrittoId", "==", iscrittoId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};
export const fetchAllPagamenti = async () => {
  const q = query(
    collection(db, "pagamenti"),
    orderBy("dataPagamento", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};
export const addPagamento = async (nuovoPagamento) => {
  await addDoc(collection(db, "pagamenti"), nuovoPagamento);
};

// --- SERVIZI PER GRUPPI ---
export const fetchGruppi = async () => {
  const q = query(collection(db, "gruppi"), orderBy("nome"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
export const addGruppo = async (nuovoGruppo) => {
  await addDoc(collection(db, "gruppi"), nuovoGruppo);
};
export const updateGruppo = async (updatedGruppo) => {
  const gruppoRef = doc(db, "gruppi", updatedGruppo.id);
  await updateDoc(gruppoRef, updatedGruppo);
};
export const updateGruppoMembri = async (gruppoId, nuoviMembriIds) => {
  const gruppoRef = doc(db, "gruppi", gruppoId);
  await updateDoc(gruppoRef, { membri: nuoviMembriIds });
};
export const deleteGruppo = async (id) => {
  await deleteDoc(doc(db, "gruppi", id));
};

// --- SERVIZI PER TECNICI (EX STAFF) ---
const TECNICI_COLLECTION = "staff";

export const fetchTecnici = async () => {
  // Ho rimosso l'ordinamento dalla query per evitare errori di indice mancante su Firebase.
  const q = query(collection(db, TECNICI_COLLECTION));
  const querySnapshot = await getDocs(q);
  const tecniciList = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Ordiniamo i dati qui, nel codice, in modo sicuro.
  // Questo previene l'errore se un tecnico non ha il campo 'cognome'.
  return tecniciList.sort((a, b) => {
    const cognomeA = a.cognome || ""; // Se il cognome non esiste, usa una stringa vuota
    const cognomeB = b.cognome || ""; // Se il cognome non esiste, usa una stringa vuota
    return cognomeA.localeCompare(cognomeB);
  });
};
export const addTecnico = async (data) => {
  await addDoc(collection(db, TECNICI_COLLECTION), data);
};
export const updateTecnico = async (data) => {
  const { id, ...rest } = data;
  const docRef = doc(db, TECNICI_COLLECTION, id);
  await updateDoc(docRef, rest);
};
export const deleteTecnico = async (id) => {
  await deleteDoc(doc(db, TECNICI_COLLECTION, id));
};

// --- SERVIZI PER DOCUMENTI ISCRITTI ---
export const uploadFile = async (file, iscrittoId) => {
  const filePath = `documenti_iscritti/${iscrittoId}/${Date.now()}_${
    file.name
  }`;
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  const docData = {
    iscrittoId,
    name: file.name,
    url,
    filePath,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, "documenti_iscritti"), docData);
  return { id: docRef.id, ...docData };
};
export const fetchDocumentsByIscrittoId = async (iscrittoId) => {
  const q = query(
    collection(db, "documenti_iscritti"),
    where("iscrittoId", "==", iscrittoId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
export const deleteFile = async (docId, filePath) => {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
  await deleteDoc(doc(db, "documenti_iscritti", docId));
};

// --- NUOVI SERVIZI PER DOCUMENTI TECNICI ---
const TECNICI_DOCS_COLLECTION = "documenti_tecnici";
export const uploadTecnicoFile = async (file, tecnicoId) => {
  const filePath = `documenti_tecnici/${tecnicoId}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  const docData = {
    tecnicoId,
    name: file.name,
    url,
    filePath,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, TECNICI_DOCS_COLLECTION), docData);
  return { id: docRef.id, ...docData };
};
export const fetchTecnicoDocuments = async (tecnicoId) => {
  const q = query(
    collection(db, TECNICI_DOCS_COLLECTION),
    where("tecnicoId", "==", tecnicoId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
export const deleteTecnicoFile = async (docId, filePath) => {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
  await deleteDoc(doc(db, TECNICI_DOCS_COLLECTION, docId));
};

// --- SERVIZI PER AGENDA ---
const formatEventFromFirestore = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    start: data.start.toDate().toISOString(),
    end: data.end ? data.end.toDate().toISOString() : null,
    description: data.description || "",
  };
};
const formatEventForFirestore = (eventData) => {
  const { id, ...data } = eventData;
  return {
    ...data,
    start: Timestamp.fromDate(new Date(data.start)),
    end: data.end ? Timestamp.fromDate(new Date(data.end)) : null,
  };
};
export const fetchAgendaEvents = async () => {
  const q = query(collection(db, "agendaEvents"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(formatEventFromFirestore);
};
export const addAgendaEvent = async (newEvent) => {
  const dataToSave = formatEventForFirestore(newEvent);
  await addDoc(collection(db, "agendaEvents"), dataToSave);
};
export const updateAgendaEvent = async (updatedEvent) => {
  const { id, ...data } = updatedEvent;
  const dataToSave = formatEventForFirestore(data);
  const eventRef = doc(db, "agendaEvents", id);
  await updateDoc(eventRef, dataToSave);
};
export const deleteAgendaEvent = async (eventId) => {
  await deleteDoc(doc(db, "agendaEvents", eventId));
};
