import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, X } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function SubscriptionDialog({ open, onClose, devices = [], planName = null }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const monthlyTotal = devices.reduce((total, device) => total + device.monthly_price * device.quantity, 0);
  const installationTotal = devices.reduce((total, device) => total + device.installation_price * device.quantity, 0);
  const deviceCount = devices.reduce((total, device) => total + device.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="subscription-dialog-title">
      <button type="button" className="absolute inset-0 cursor-default bg-slate-950/85 backdrop-blur-sm" onClick={onClose} aria-label="Fechar detalhes da adesão" />
      <div className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[var(--nx-panel)] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] p-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300"><Package className="h-5 w-5" /></span>
            <div>
              <h2 id="subscription-dialog-title" className="text-lg font-bold text-white">Minha adesão</h2>
              <p className="mt-1 text-xs text-slate-400">Plano e dispositivos selecionados</p>
            </div>
          </div>
          <button type="button" autoFocus onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          {planName ? (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-emerald-200">Plano {planName} ativo</p>
                <p className="mt-1 text-xs text-slate-400">Plano predefinido vinculado a esta adesão.</p>
              </div>
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-white/[0.07] bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-slate-200">Nenhum plano predefinido ativo</p>
              <p className="mt-1 text-xs text-slate-500">{devices.length ? 'Esta é uma adesão personalizada.' : 'Selecione um plano ou monte sua adesão personalizada.'}</p>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Dispositivos selecionados</h3>
            <span className="text-xs text-slate-500">{deviceCount} {deviceCount === 1 ? 'unidade' : 'unidades'}</span>
          </div>

          {devices.length ? (
            <ul className="divide-y divide-white/[0.07] rounded-xl border border-white/[0.07] bg-slate-950/40 px-4">
              {devices.map((device) => (
                <li key={device.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100">{device.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Quantidade: {device.quantity}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-blue-300">{formatCurrency(device.monthly_price * device.quantity)}</p>
                    <p className="mt-1 text-xs text-slate-500">por mês</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 px-5 py-8 text-center">
              <p className="text-sm text-slate-400">Nenhum dispositivo foi selecionado nesta adesão.</p>
            </div>
          )}

          {devices.length > 0 && (
            <div className="mt-5 space-y-2 rounded-xl bg-slate-950/60 p-4 text-sm">
              <div className="flex items-center justify-between gap-4"><span className="text-slate-400">Instalação única</span><span className="font-semibold text-slate-200">{formatCurrency(installationTotal)}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-slate-400">Assinatura mensal</span><span className="font-bold text-blue-300">{formatCurrency(monthlyTotal)}</span></div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] p-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer">Fechar</button>
          <Link to="/adesao" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500">Alterar adesão</Link>
        </div>
      </div>
    </div>
  );
}
