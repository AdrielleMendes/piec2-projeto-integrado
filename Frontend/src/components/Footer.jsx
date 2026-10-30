import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-3">

          {/* Marca */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span>Nex<span className="text-blue-500">Guard</span></span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Ecossistema de segurança residencial com monitoramento autônomo e resposta técnica imediata.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navegação</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Início</Link></li>
              <li><a href="/#sobre" className="hover:text-blue-400 transition-colors">A Empresa</a></li>
              <li><a href="/#servicos" className="hover:text-blue-400 transition-colors">Serviços</a></li>
              <li><a href="/#tecnologia" className="hover:text-blue-400 transition-colors">Tecnologia</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>contato@nexguard.com.br</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>0800 000 0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Atendimento nacional, 24h por dia</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {currentYear} NexGuard. Todos os direitos reservados.</span>
          <span>Segurança residencial inteligente.</span>
        </div>
      </div>
    </footer>
  );
}
