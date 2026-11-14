import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Planos from './pages/Planos';
import Adesao from './pages/Adesao';
import Central from './pages/Central';

function AppContent() {
  const location = useLocation();
  const isCentral = location.pathname.startsWith('/central');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" id="inicio">
      {!isCentral && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/adesao" element={<Adesao />} />
        <Route path="/central" element={<Central />} />
      </Routes>
      {!isCentral && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
