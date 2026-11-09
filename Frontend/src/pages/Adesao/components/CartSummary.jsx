import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function CartSummary({ items, monthlyTotal, installationTotal, onRemove, onCheckout }) {
  const isEmpty = items.length === 0;

  return (
    <aside className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:sticky lg:top-24 h-fit">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 bg-blue-600/15 rounded-lg">
          <ShoppingCart className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Resumo do Pacote</h3>
      </div>

      {isEmpty ? (
        <p className="text-slate-500 text-sm leading-relaxed">
          Nenhum dispositivo selecionado. Escolha os equipamentos no catálogo acima para montar o pacote de proteção.
        </p>
      ) : (
        <>
          {/* Lista dinâmica de itens */}
          <ul className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
            {items.map(({ device, quantity }) => (
              <li
                key={device.id}
                className="flex items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{device.name}</p>
                  <p className="text-xs text-slate-500">
                    {quantity}x · {formatCurrency(device.monthly_price)}/mês
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(device)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                  aria-label={`Remover ${device.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          {/* Totais em tempo real */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Instalação (única)</span>
              <span className="text-slate-200 font-medium">{formatCurrency(installationTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Assinatura mensal</span>
              <span className="text-blue-400 font-bold text-xl">{formatCurrency(monthlyTotal)}</span>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onCheckout}
        disabled={isEmpty}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:shadow-none cursor-pointer text-sm"
      >
        <span>{isEmpty ? 'Selecione ao menos um dispositivo' : 'Preencher Dados de Instalação'}</span>
        {!isEmpty && <ArrowRight className="w-4 h-4" />}
      </button>
    </aside>
  );
}
