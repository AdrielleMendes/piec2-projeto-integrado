import { Check, Crown, Star, Shield, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

const PLAN_ICONS = {
  shield: Shield,
  star: Star,
  crown: Crown,
};

export default function PlanCard({ plan, items, monthlyTotal, installationTotal, highlighted, onSelect }) {
  const Icon = PLAN_ICONS[plan.icon] ?? Shield;

  return (
    <div
      className={`relative flex flex-col bg-slate-900 p-8 rounded-2xl border transition-all duration-300 ease-out hover:-translate-y-1.5 ${
        highlighted
          ? 'border-blue-500/70 shadow-xl shadow-blue-500/15 ring-1 ring-blue-500/40'
          : 'border-slate-800 hover:border-slate-600 hover:shadow-xl hover:shadow-slate-950/60'
      }`}
    >
      {/* Selo de destaque */}
      {highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-lg shadow-blue-600/40">
          Mais Popular
        </span>
      )}

      {/* Cabeçalho do plano */}
      <div className="text-center mb-6">
        <div className={`p-3.5 rounded-xl w-fit mx-auto mb-4 ${highlighted ? 'bg-blue-600/20' : 'bg-slate-800/80'}`}>
          <Icon className={`w-7 h-7 ${highlighted ? 'text-blue-400' : 'text-slate-400'}`} />
        </div>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{plan.name}</h3>
        <p className="text-slate-500 text-sm mt-1.5">{plan.tagline}</p>
      </div>

      {/* Valores */}
      <div className="text-center border-y border-slate-800 py-5 mb-6">
        <p className="text-blue-400 font-bold text-3xl">
          {formatCurrency(monthlyTotal)}
          <span className="text-slate-500 text-sm font-normal"> /mês</span>
        </p>
        <p className="text-slate-500 text-xs mt-1.5">
          Instalação única: {formatCurrency(installationTotal)}
        </p>
      </div>

      {/* Itens inclusos */}
      <ul className="space-y-3 mb-8 flex-1">
        {items.map(({ device, quantity }) => (
          <li key={device.id} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span className="text-slate-300">
              {quantity > 1 && <span className="text-blue-400 font-semibold">{quantity}x </span>}
              {device.name}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onSelect(plan)}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all duration-300 cursor-pointer text-sm ${
          highlighted
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600'
        }`}
      >
        <span>Assinar {plan.name}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
