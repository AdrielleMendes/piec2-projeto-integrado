import { Cctv, Radar, Lock, Cpu, Siren, Shield, Check, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

const CATEGORY_ICONS = {
  camera: Cctv,
  sensor: Radar,
  fechadura: Lock,
  central: Cpu,
  alarme: Siren,
};

export default function DeviceCard({ device, selected, quantity, onToggle, onQuantityChange }) {
  const Icon = CATEGORY_ICONS[device.category] ?? Shield;

  return (
    <div
      onClick={() => onToggle(device)}
      className={`group relative flex flex-col bg-slate-900 p-6 rounded-2xl border transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 ${
        selected
          ? 'border-blue-500/70 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/40'
          : 'border-slate-800 hover:border-slate-600 hover:shadow-xl hover:shadow-slate-950/60'
      }`}
    >
      {/* Indicador de seleção */}
      <div
        className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
          selected
            ? 'bg-blue-600 border-blue-500 scale-100'
            : 'bg-slate-800/80 border-slate-700 scale-90 group-hover:border-slate-500'
        }`}
      >
        {selected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>

      {/* Imagem/Ícone do dispositivo */}
      <div
        className={`p-4 rounded-xl mb-5 w-fit transition-colors duration-300 ${
          selected ? 'bg-blue-600/20' : 'bg-slate-800/80 group-hover:bg-blue-600/10'
        }`}
      >
        <Icon
          className={`w-8 h-8 transition-all duration-300 group-hover:scale-110 ${
            selected ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
          }`}
        />
      </div>

      <h3 className={`text-lg font-bold mb-2 pr-6 transition-colors duration-300 ${selected ? 'text-white' : 'text-slate-100'}`}>
        {device.name}
      </h3>

      <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">
        {device.description}
      </p>

      {/* Valores */}
      <div className="space-y-1 mb-4">
        <p className="text-blue-400 font-bold text-lg">
          {formatCurrency(device.monthly_price)}
          <span className="text-slate-500 text-xs font-normal"> /mês</span>
        </p>
        <p className="text-slate-500 text-xs">
          Instalação: {formatCurrency(device.installation_price)}
        </p>
      </div>

      {/* Controle de quantidade (somente quando selecionado) */}
      {selected && (
        <div
          className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="text-xs text-slate-400 font-medium">Quantidade</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onQuantityChange(device, quantity - 1)}
              disabled={quantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-white font-semibold text-sm w-5 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(device, quantity + 1)}
              disabled={quantity >= 50}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
