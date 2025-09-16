import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore"; 
import { db } from './firebase.js'; 
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IscrittiPage from './pages/IscrittiPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ReportPage from './pages/ReportPage.jsx'; // <-- NUOVO IMPORT

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

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage iscritti={iscritti} loading={loading} />} />
        <Route path="/iscritti" element={<IscrittiPage iscrittiList={iscritti} onDataUpdate={fetchIscritti} />} />
        {/* --- INIZIA MODIFICA --- */}
        <Route path="/report" element={<ReportPage />} />
        {/* --- FINISCI MODIFICA --- */}
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