// File: src/services/firebaseService.js (AGGIORNATO)
import moment from "moment";

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
  writeBatch,
  Timestamp, // Assicurati che Timestamp sia importato
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
  const q = query(collection(db, TECNICI_COLLECTION));
  const querySnapshot = await getDocs(q);
  const tecniciList = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    // AGGIUNTA: Recupera pagaOraria e assicura che sia un numero
    pagaOraria: parseFloat(doc.data().pagaOraria) || 0,
  }));
  return tecniciList.sort((a, b) => {
    const cognomeA = a.cognome || "";
    const cognomeB = b.cognome || "";
    return cognomeA.localeCompare(cognomeB);
  });
};
export const addTecnico = async (data) => {
  // AGGIUNTA: Converte pagaOraria in float prima di salvare
  const dataToSave = {
    ...data,
    pagaOraria: parseFloat(data.pagaOraria) || 0,
  };
  await addDoc(collection(db, TECNICI_COLLECTION), dataToSave);
};
export const updateTecnico = async (data) => {
  const { id, ...rest } = data;
  // AGGIUNTA: Converte pagaOraria in float prima di salvare
  const dataToUpdate = {
    ...rest,
    pagaOraria: parseFloat(rest.pagaOraria) || 0,
  };
  const docRef = doc(db, TECNICI_COLLECTION, id);
  await updateDoc(docRef, dataToUpdate);
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
  await deleteDoc(doc(db, "documenti_tecnici", docId));
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
    // Aggiungiamo i campi per il promemoria
    reminderDate: data.reminderDate ? data.reminderDate.toDate().toISOString().split('T')[0] : null,
    reminderSent: data.reminderSent || false,
  };
};
const formatEventForFirestore = (eventData) => {
  const { id, ...data } = eventData;
  return {
    ...data,
    reminderDate: data.reminderDate ? Timestamp.fromDate(new Date(data.reminderDate)) : null,
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

/**
 * Aggiorna parzialmente un evento nell'agenda senza formattare l'intero oggetto.
 * Utile per modifiche semplici come l'aggiornamento di un flag.
 */
export const updateAgendaEventPartial = async (updatedEvent) => {
  const { id, ...data } = updatedEvent;
  const eventRef = doc(db, "agendaEvents", id);
  await updateDoc(eventRef, data);
};

// --- SERVIZI PER REGISTRO PRESENZE TECNICI ---
const PRESENZE_COLLECTION = "presenzeTecnici";

const formatPresenzaFromFirestore = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    start: data.start.toDate().toISOString(),
    end: data.end ? data.end.toDate().toISOString() : null,
  };
};

const formatPresenzaForFirestore = (eventData) => {
  const { id, ...data } = eventData;
  return {
    ...data,
    start: Timestamp.fromDate(new Date(data.start)),
    end: data.end ? Timestamp.fromDate(new Date(data.end)) : Timestamp.fromDate(new Date(data.start)), // Assicura che end esista
  };
};

export const fetchPresenzeTecnici = async () => {
  const q = query(collection(db, PRESENZE_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(formatPresenzaFromFirestore);
};

export const addPresenzaTecnico = async (newEvent) => {
  const dataToSave = formatPresenzaForFirestore(newEvent);
  await addDoc(collection(db, PRESENZE_COLLECTION), dataToSave);
};

export const updatePresenzaTecnico = async (updatedEvent) => {
  const { id, ...data } = updatedEvent;
  const dataToSave = formatPresenzaForFirestore(data);
  const eventRef = doc(db, PRESENZE_COLLECTION, id);
  await updateDoc(eventRef, dataToSave);
};

export const deletePresenzaTecnico = async (eventId) => {
  await deleteDoc(doc(db, PRESENZE_COLLECTION, eventId));
};

// --- SERVIZI PER PROMEMORIA AGENDA ---

/**
 * Controlla gli eventi con promemoria scaduti e non ancora inviati.
 * @param {function} showReminder - La funzione per mostrare il dialogo di promemoria.
 * @param {function} navigate - La funzione di navigazione di React Router.
 */
export const checkAndNotifyReminders = async (showReminder, navigate) => {
  const today = moment().startOf('day').toDate();

  try {
    // 1. Query per trovare i promemoria scaduti e non ancora inviati
    const q = query(
      collection(db, "agendaEvents"),
      // La query non può avere due filtri di disuguaglianza sullo stesso campo
      // quindi filtriamo per reminderSent e poi verifichiamo la data in locale.
      // Questo è un compromesso necessario per le limitazioni di Firestore.
      // Per performance migliori, si potrebbe usare una Cloud Function che popola
      // un campo "needsNotification" su cui fare la query.
      // Per ora, questo approccio è sufficiente.
      where("reminderSent", "==", false),
      where("reminderDate", "!=", null)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return; // Nessun promemoria da mostrare
    }

    querySnapshot.forEach((doc) => {
      const eventData = doc.data();
      // Filtro data lato client
      if (moment(eventData.reminderDate.toDate()).isSameOrBefore(today, 'day')) {
        // Usiamo formatEventFromFirestore per avere un oggetto evento consistente
        const event = formatEventFromFirestore(doc);
        const formattedDate = moment(event.start).format('DD/MM/YYYY');
        
        const message = `Ricorda l'evento "${event.title}" del ${formattedDate}.`;
        showReminder(message, event);
        // L'aggiornamento a reminderSent=true viene gestito dal contesto
        // quando l'utente clicca "Non mostrare più" o chiude il dialogo.
      }
    });
  } catch (error) {
    console.error("Errore nel controllo dei promemoria:", error);
  }
};