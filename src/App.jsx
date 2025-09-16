import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore"; 
import { db } from './firebase.js'; 
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IscrittiPage from './pages/IscrittiPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import GruppiPage from './pages/GruppiPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import './App.css';

function MainApp() {
  const [iscritti, setIscritti] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIscritti = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "iscritti"));
      const iscrittiList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIscritti(iscrittiList);
    } catch (error) { console.error("Errore: ", error); } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchIscritti(); }, []);

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
        <Route path="/" element={<DashboardPage iscritti={iscritti} loading={loading} />} />
        <Route path="/iscritti" element={<IscrittiPage iscrittiList={iscritti} onDataUpdate={fetchIscritti} />} />
        <Route path="/gruppi" element={<GruppiPage iscrittiList={iscritti} />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={ currentUser ? <MainApp /> : <Navigate to="/login" /> } />
    </Routes>
  );
}

export default App;