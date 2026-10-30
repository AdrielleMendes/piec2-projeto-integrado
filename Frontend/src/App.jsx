import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Adesao from './pages/Adesao';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" id="inicio">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adesao" element={<Adesao />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
