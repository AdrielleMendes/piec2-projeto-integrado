import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import AccessControlPanel from '../AccessControlPanel';

export default function ControleAcesso() {
  return (
    <main className="min-h-screen bg-slate-950 pt-16">
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-cyan-300" />
            NexGuard Access
          </div>
          <Link to="/central" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar à central
          </Link>
        </div>
      </div>
      <AccessControlPanel />
    </main>
  );
}
