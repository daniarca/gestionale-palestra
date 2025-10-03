// File: src/App.jsx

import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import IscrittiPage from "./pages/IscrittiPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import GruppiPage from "./pages/GruppiPage.jsx";
import TecniciPage from "./pages/TecniciPage.jsx"; // <-- RINOMINATO
import OrarioPage from "./pages/OrarioPage.jsx";
import AgendaPage from "./pages/AgendaPage.jsx";
import ArchivioPage from "./pages/ArchivioPage.jsx";
import SchedaSocioPage from "./pages/SchedaSocioPage.jsx";
import SchedaTecnicoPage from "./pages/SchedaTecnicoPage.jsx"; // <-- NUOVA PAGINA
import Notifier from "./components/Notifier.jsx";
import DocumentazionePage from "./pages/DocumentazionePage.jsx";
import "./App.css";

function MainApp() {
  // ... il resto del componente non cambia
  const [iscritti, setIscritti] = useState([]);
  const [gruppi, setGruppi] = useState([]);
  const [pagamenti, setPagamenti] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Query per gli iscritti attivi (per la lista principale e la dashboard)
      const iscrittiAttiviQuery = query(
        collection(db, "iscritti"),
        where("stato", "==", "attivo")
      );
      // Query per TUTTI gli iscritti (necessaria per passare la lista completa al ReportPage)
      const allIscrittiQuery = query(collection(db, "iscritti")); 
      const gruppiQuery = query(collection(db, "gruppi"));
      const pagamentiQuery = query(collection(db, "pagamenti"));
      const staffQuery = query(collection(db, "staff"));

      const [iscrittiAttiviSnap, allIscrittiSnap, gruppiSnap, pagamentiSnap, staffSnap] =
        await Promise.all([
          getDocs(iscrittiAttiviQuery),
          getDocs(allIscrittiQuery),
          getDocs(gruppiQuery),
          getDocs(pagamentiQuery),
          getDocs(staffQuery),
        ]);

      // Imposta iscritti con la lista completa per comodità nel memo
      setIscritti(
        allIscrittiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setGruppi(gruppiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPagamenti(
        pagamentiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setStaff(staffSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Errore nel recupero dei dati principali:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleDataUpdate = () => {
    fetchData();
  };
  
  const handleIscrittoAggiunto = (nuovoIscrittoConId) => {
    // Aggiunge all'elenco completo per l'aggiornamento immediato
    setIscritti((prev) =>
      [...prev, nuovoIscrittoConId].sort((a, b) =>
        a.cognome.localeCompare(b.cognome)
      )
    );
  };
  
  const iscrittiAttivi = useMemo(() => iscritti.filter(i => i.stato === 'attivo'), [iscritti]);


  const notifications = useMemo(() => {
    if (!iscrittiAttivi) return []; // Usa iscritti attivi per le notifiche
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
      alerts.push({
        type: "abbonamenti_scaduti",
        count: abbonamentiScaduti.length,
        message: `${abbonamentiScaduti.length} Abbonamenti Scaduti`,
      });
      
    if (certificatiInScadenza.length > 0)
      alerts.push({
        type: "certificati_scadenza",
        count: certificatiInScadenza.length,
        message: `${certificatiInScadenza.length} Certificati in Scadenza`,
      });
      
    if (certificatiMancanti.length > 0)
      alerts.push({
        type: "certificati_mancanti",
        count: certificatiMancanti.length,
        message: `${certificatiMancanti.length} Certificati Mancanti`,
      });
      
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
            />
          }
        />
        <Route
          path="/iscritti"
          element={
            <IscrittiPage
              iscrittiList={iscrittiAttivi}
              gruppiList={gruppi}
              onDataUpdate={handleDataUpdate}
              onIscrittoAdded={handleIscrittoAggiunto}
            />
          }
        />
        <Route
          path="/iscritti/:iscrittoId"
          element={<SchedaSocioPage onDataUpdate={handleDataUpdate} />}
        />
        <Route
          path="/archivio"
          element={<ArchivioPage onDataUpdate={handleDataUpdate} />}
        />

        {/* ROTTE AGGIORNATE E NUOVE */}
        <Route path="/tecnici" element={<TecniciPage />} />
        <Route path="/tecnici/:tecnicoId" element={<SchedaTecnicoPage />} />

        <Route
          path="/gruppi"
          element={<GruppiPage iscrittiList={iscrittiAttivi} />}
        />
        <Route
          path="/report"
          // PASSA LA LISTA COMPLETA DI ISCRITTI (ATTIVI + ARCHIVIATI) per il report finanziario
          element={<ReportPage pagamentiList={pagamenti} iscrittiList={iscritti} />}
        />
        <Route path="/orario" element={<OrarioPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/documentazione" element={<DocumentazionePage />} />
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
        <Route
          path="/*"
          element={currentUser ? <MainApp /> : <Navigate to="/login" />}
        />
      </Routes>
      <Notifier />
    </>
  );
}

export default App;