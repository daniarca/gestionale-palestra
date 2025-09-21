import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore"; 
import { db } from './firebase.js'; 
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IscrittiPage from './pages/IscrittiPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import GruppiPage from './pages/GruppiPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import OrarioPage from './pages/OrarioPage.jsx';
import ArchivioPage from './pages/ArchivioPage.jsx';
import SchedaSocioPage from './pages/SchedaSocioPage.jsx';
import Notifier from './components/Notifier.jsx';
import './App.css';

function MainApp() {
  const [iscritti, setIscritti] = useState([]);
  const [gruppi, setGruppi] = useState([]);
  const [pagamenti, setPagamenti] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const iscrittiQuery = query(collection(db, "iscritti"), where("stato", "==", "attivo"));
      const gruppiQuery = query(collection(db, "gruppi"));
      const pagamentiQuery = query(collection(db, "pagamenti"));
      const staffQuery = query(collection(db, "staff"));

      const [iscrittiSnap, gruppiSnap, pagamentiSnap, staffSnap] = await Promise.all([
        getDocs(iscrittiQuery),
        getDocs(gruppiQuery),
        getDocs(pagamentiQuery),
        getDocs(staffQuery)
      ]);

      setIscritti(iscrittiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setGruppi(gruppiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPagamenti(pagamentiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setStaff(staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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
    setIscritti(prevIscritti => 
      [...prevIscritti, nuovoIscrittoConId].sort((a, b) => a.cognome.localeCompare(b.cognome))
    );
  };

  const notifications = useMemo(() => {
    if (!iscritti) return [];
    const alerts = [];
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const dataLimiteCertificati = new Date();
    dataLimiteCertificati.setDate(oggi.getDate() + 30);
    const abbonamentiScaduti = iscritti.filter(i => i.abbonamento?.scadenza && new Date(i.abbonamento.scadenza) < oggi);
    const certificatiInScadenza = iscritti.filter(i => {
      if (!i.certificatoMedico?.scadenza) return false;
      const scadenza = new Date(i.certificatoMedico.scadenza);
      return scadenza >= oggi && scadenza <= dataLimiteCertificati;
    });
    const certificatiMancanti = iscritti.filter(i => !i.certificatoMedico?.presente || !i.certificatoMedico?.scadenza);
    const pagamentiInSospeso = iscritti.filter(i => i.statoPagamento === 'In Sospeso');
    if (abbonamentiScaduti.length > 0) alerts.push({ type: 'abbonamenti_scaduti', count: abbonamentiScaduti.length, message: `${abbonamentiScaduti.length} Abbonamenti Scaduti` });
    if (certificatiInScadenza.length > 0) alerts.push({ type: 'certificati_scadenza', count: certificatiInScadenza.length, message: `${certificatiInScadenza.length} Certificati in Scadenza` });
    if (certificatiMancanti.length > 0) alerts.push({ type: 'certificati_mancanti', count: certificatiMancanti.length, message: `${certificatiMancanti.length} Certificati Mancanti` });
    if (pagamentiInSospeso.length > 0) alerts.push({ type: 'pagamenti_sospeso', count: pagamentiInSospeso.length, message: `${pagamentiInSospeso.length} Pagamenti in Sospeso` });
    return alerts;
  }, [iscritti]);

  return (
    <Layout notifications={notifications}>
      <Routes>
        <Route path="/" element={<DashboardPage iscritti={iscritti} loading={loading} gruppi={gruppi} pagamenti={pagamenti} />} />
        <Route path="/iscritti" element={<IscrittiPage iscrittiList={iscritti} onDataUpdate={handleDataUpdate} onIscrittoAdded={handleIscrittoAggiunto} />} />
        <Route path="/iscritti/:iscrittoId" element={<SchedaSocioPage onDataUpdate={handleDataUpdate} />} />
        <Route path="/archivio" element={<ArchivioPage onDataUpdate={handleDataUpdate} />} />
        <Route path="/gruppi" element={<GruppiPage iscrittiList={iscritti} />} />
        <Route path="/staff" element={<StaffPage staffList={staff} />} />
        <Route path="/report" element={<ReportPage pagamentiList={pagamenti} />} />
        <Route path="/orario" element={<OrarioPage gruppiList={gruppi} />} />
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
        <Route path="/*" element={ currentUser ? <MainApp /> : <Navigate to="/login" /> } />
      </Routes>
      <Notifier />
    </>
  );
}

export default App;