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
// ... (Tutta la parte degli iscritti, pagamenti, gruppi, staff e documenti non cambia)

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

export const fetchStaff = async () => {
  const q = query(collection(db, "staff"), orderBy("cognome"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addStaff = async (nuovoMembro) => {
  await addDoc(collection(db, "staff"), nuovoMembro);
};

export const deleteStaff = async (id) => {
  await deleteDoc(doc(db, "staff", id));
};

export const uploadFile = async (file, iscrittoId) => {
  const filePath = `documenti/${iscrittoId}/${Date.now()}_${file.name}`;
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

  const docRef = await addDoc(collection(db, "documenti"), docData);
  return { id: docRef.id, ...docData };
};

export const fetchDocumentsByIscrittoId = async (iscrittoId) => {
  const q = query(
    collection(db, "documenti"),
    where("iscrittoId", "==", iscrittoId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteFile = async (docId, filePath) => {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
  await deleteDoc(doc(db, "documenti", docId));
};

// --- SERVIZI PER AGENDA (CORRETTI) ---

// Converte i dati da Firestore a un formato che FullCalendar capisce
const formatEventFromFirestore = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    start: data.start.toDate().toISOString(),
    end: data.end ? data.end.toDate().toISOString() : null,
    allDay: data.allDay,
    color: data.color,
    description: data.description || "",
  };
};

// Converte i dati dal form a un formato che Firestore capisce (usa i Timestamp)
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
