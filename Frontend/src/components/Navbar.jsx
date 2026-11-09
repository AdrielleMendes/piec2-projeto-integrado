import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const location = useLocation();

  // Âncoras da home: mantém rolagem suave na home e funciona a partir de outras páginas
  const isHome = location.pathname === '/';
  const anchor = (id) => (isHome ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detector da Seção de Tecnologia
  useEffect(() => {
    const techSection = document.getElementById('tecnologia');
    if (!techSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLightMode(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(techSection);
    return () => observer.disconnect();
  }, []);

  const isVisible = !scrolled || isHovered || mobileMenuOpen;

  const getNavBackground = () => {
    if (!scrolled) return "bg-transparent border-transparent py-5";
    if (isLightMode) return "bg-white/90 backdrop-blur-md border-slate-200/80 shadow-xl py-3";
    return "bg-slate-950/85 backdrop-blur-md border-slate-800/80 shadow-xl py-3";
  };

  return (
    <>
      {/* Gatilho invisível no topo */}
      {scrolled && !isHovered && (
        <div 
          className="fixed top-0 left-0 right-0 h-4 z-50 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
        />
      )}

      <nav 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-700 ease-out will-change-transform ${
          isVisible 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${getNavBackground()}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo (Esquerda) */}
            <Link
              to="/"
              className={`flex items-center gap-2 font-bold text-xl tracking-tight transition-colors duration-500 ${
                isLightMode && scrolled ? "text-slate-900" : "text-white"
              }`}
            >
              <div className="p-2 bg-blue-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span>Nex<span className="text-blue-500">Guard</span></span>
            </Link>

            {/* Grupo da Direita: Links + Botão */}
            <div className="hidden md:flex items-center gap-8">
              
              {/* Links de Navegação */}
              <div className={`flex items-center gap-8 text-sm font-medium transition-colors duration-500 ${
                isLightMode && scrolled ? "text-slate-700" : "text-slate-300"
              }`}>
                <a href={anchor('sobre')} className="hover:text-blue-500 transition-colors">A Empresa</a>
                <a href={anchor('servicos')} className="hover:text-blue-500 transition-colors">Serviços</a>
                <a href={anchor('tecnologia')} className="hover:text-blue-500 transition-colors">Tecnologia</a>
              </div>

            </div>

            {/* Menu Mobile */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 cursor-pointer transition-colors ${
                  isLightMode && scrolled ? "text-slate-800" : "text-slate-300 hover:text-white"
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Dropdown Mobile */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-4 pt-4 pb-6 space-y-3 mt-3 backdrop-blur-xl transition-colors ${
            isLightMode && scrolled
              ? "bg-white/95 border-slate-200" 
              : "bg-slate-950/95 border-slate-800"
          }`}>
            <a 
              href={anchor('sobre')} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`block py-2 ${isLightMode && scrolled ? "text-slate-800" : "text-slate-300"}`}
            >
              A Empresa
            </a>
            <a 
              href={anchor('servicos')} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`block py-2 ${isLightMode && scrolled ? "text-slate-800" : "text-slate-300"}`}
            >
              Serviços
            </a>
            <a 
              href={anchor('tecnologia')} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`block py-2 ${isLightMode && scrolled ? "text-slate-800" : "text-slate-300"}`}
            >
              Tecnologia
            </a>
          </div>
        )}
      </nav>
    </>
  );
}