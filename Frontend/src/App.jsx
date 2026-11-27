import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Planos from './pages/Planos';
import Adesao from './pages/Adesao';
import Central from './pages/Central';
import ControleAcesso from './pages/ControleAcesso';

function AppContent() {
  const location = useLocation();
  const isPrivateArea = ['/central', '/controle-acesso'].some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" id="inicio">
      {!isPrivateArea && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/adesao" element={<Adesao />} />
        <Route path="/central" element={<Central />} />
        <Route path="/controle-acesso" element={<ControleAcesso />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!isPrivateArea && <Footer />}
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
