// File: src/App.jsx (AGGIORNATO)

import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "./firebase.js";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import IscrittiPage from "./pages/IscrittiPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import GruppiPage from "./pages/GruppiPage.jsx";
import TecniciPage from "./pages/TecniciPage.jsx";
import OrarioPage from "./pages/OrarioPage.jsx";
import AgendaPage from "./pages/AgendaPage.jsx";
import ArchivioPage from "./pages/ArchivioPage.jsx";
import SchedaSocioPage from "./pages/SchedaSocioPage.jsx";
import SchedaTecnicoPage from "./pages/SchedaTecnicoPage.jsx";
import Notifier from "./components/Notifier.jsx";
import DocumentazionePage from "./pages/DocumentazionePage.jsx";
import CreditsPage from "./pages/CreditsPage.jsx";
import RegistroTecniciPage from "./pages/RegistroTecniciPage.jsx"; // Assicurati che l'import sia presente
import { fetchPresenzeTecnici, fetchAgendaEvents } from "./services/firebaseService.js";
import "./App.css";

function MainApp() {
  const [iscritti, setIscritti] = useState([]);
  const [gruppi, setGruppi] = useState([]);
  const [pagamenti, setPagamenti] = useState([]);
  const [staff, setStaff] = useState([]);
  const [agendaEvents, setAgendaEvents] = useState([]); 
  const [presenzeTecnici, setPresenzeTecnici] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      if (refreshKey === 0) setLoading(true);
      
      const allIscrittiQuery = query(collection(db, "iscritti")); 
      const gruppiQuery = query(collection(db, "gruppi"));
      const pagamentiQuery = query(collection(db, "pagamenti"), orderBy("dataPagamento", "desc"));
      const staffQuery = query(collection(db, "staff"));

      const [allIscrittiSnap, gruppiSnap, pagamentiSnap, staffSnap, agendaEventsList, presenzeTecniciList] =
        await Promise.all([
          getDocs(allIscrittiQuery),
          getDocs(gruppiQuery),
          getDocs(pagamentiQuery),
          getDocs(staffQuery),
          fetchAgendaEvents(), 
          fetchPresenzeTecnici(), 
        ]);

      setIscritti(allIscrittiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setGruppi(gruppiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPagamenti(pagamentiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setStaff(staffSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setAgendaEvents(agendaEventsList);
      setPresenzeTecnici(presenzeTecniciList);

    } catch (error) {
      console.error("Errore nel recupero dei dati principali:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchData(); }, [refreshKey]);
  
  const handleDataUpdate = () => setRefreshKey(prevKey => prevKey + 1);
  
  const handleIscrittoAggiunto = (nuovoIscrittoConId) => {
    setIscritti((prev) => [...prev, nuovoIscrittoConId].sort((a, b) => a.cognome.localeCompare(b.cognome)));
    handleDataUpdate();
  };
  
  const iscrittiAttivi = useMemo(() => iscritti.filter(i => i.stato === 'attivo'), [iscritti]);
  const iscrittiArchiviati = useMemo(() => iscritti.filter(i => i.stato === 'archiviato'), [iscritti]);

  const notifications = useMemo(() => {
    // ... logica notifiche (invariata)
    if (!iscrittiAttivi) return [];
    const alerts = [];
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const dataLimiteCertificati = new Date();
    dataLimiteCertificati.setDate(oggi.getDate() + 30);
    const abbonamentiScaduti = iscrittiAttivi.filter(
      (i) => i.abbonamento?.scadenza && new Date(i.abbonamento.scadenza) < oggi
    );
    const certificatiInScadenza = iscrittiAttivi.filter((i) => {
      if (!i.certificatoMedico?.scadenza) return false;
      const scadenza = new Date(i.certificatoMedico.scadenza);
      return scadenza >= oggi && scadenza <= dataLimiteCertificati;
    });
    const certificatiMancanti = iscrittiAttivi.filter(
      (i) => !i.certificatoMedico?.presente || !i.certificatoMedico?.scadenza
    );
    if (abbonamentiScaduti.length > 0)
      alerts.push({type: "abbonamenti_scaduti", count: abbonamentiScaduti.length, message: `${abbonamentiScaduti.length} Abbonamenti Scaduti`});
    if (certificatiInScadenza.length > 0)
      alerts.push({type: "certificati_scadenza", count: certificatiInScadenza.length, message: `${certificatiInScadenza.length} Certificati in Scadenza`});
    if (certificatiMancanti.length > 0)
      alerts.push({type: "certificati_mancanti", count: certificatiMancanti.length, message: `${certificatiMancanti.length} Certificati Mancanti`});
    return alerts;
  }, [iscritti]);

  return (
    <Layout notifications={notifications}>
      <Routes>
        <Route 
            path="/" 
            element={
                <DashboardPage 
                    iscritti={iscrittiAttivi} 
                    loading={loading} 
                    gruppi={gruppi} 
                    pagamenti={pagamenti}
                    iscrittiArchiviati={iscrittiArchiviati} 
                    staff={staff} 
                    agendaEvents={agendaEvents} 
                    presenzeTecnici={presenzeTecnici} 
                />
            }
        />
        <Route path="/iscritti" element={<IscrittiPage iscrittiList={iscrittiAttivi} gruppiList={gruppi} onDataUpdate={handleDataUpdate} onIscrittoAdded={handleIscrittoAggiunto}/>}/>
        <Route path="/iscritti/:iscrittoId" element={<SchedaSocioPage onDataUpdate={handleDataUpdate} />}/>
        <Route path="/archivio" element={<ArchivioPage onDataUpdate={handleDataUpdate} />}/>
        <Route path="/tecnici" element={<TecniciPage />}/>
        <Route path="/tecnici/:tecnicoId" element={<SchedaTecnicoPage />}/>
        <Route path="/gruppi" element={<GruppiPage iscrittiList={iscrittiAttivi} />}/>
        <Route path="/report" element={<ReportPage pagamentiList={pagamenti} iscrittiList={iscritti} />}/>
        <Route path="/orario" element={<OrarioPage />}/>
        <Route path="/agenda" element={<AgendaPage />}/>
        <Route path="/documentazione" element={<DocumentazionePage />}/>
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/registro-tecnici" element={<RegistroTecniciPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const { currentUser } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={currentUser ? <MainApp /> : <Navigate to="/login" />}/>
      </Routes>
      <Notifier />
    </>
  );
}

export default App;