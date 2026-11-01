import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, RefreshCw, SlidersHorizontal } from 'lucide-react';
import PlanCard from './components/PlanCard';
import { fetchDevices } from '../../services/api';

// Composição dos pacotes prontos: { [deviceId]: quantidade }
// Os valores são calculados dinamicamente a partir do catálogo da API.
const PLANS = [
  {
    id: 'normal',
    name: 'Normal',
    icon: 'shield',
    tagline: 'Proteção essencial para o dia a dia',
    highlighted: false,
    items: { 6: 1, 3: 1, 4: 2 },
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: 'star',
    tagline: 'Cobertura completa com câmeras inteligentes',
    highlighted: true,
    items: { 6: 1, 1: 1, 2: 1, 3: 2, 4: 2 },
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: 'crown',
    tagline: 'Blindagem máxima para toda a residência',
    highlighted: false,
    items: { 6: 1, 1: 2, 2: 2, 3: 3, 4: 4, 5: 2, 7: 2, 8: 1 },
  },
];

export default function Planos() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDevices();
        setDevices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resolve os itens de cada plano contra o catálogo e calcula os totais
  const plans = useMemo(
    () =>
      PLANS.map((plan) => {
        const items = Object.entries(plan.items)
          .map(([deviceId, quantity]) => ({
            device: devices.find((d) => d.id === Number(deviceId)),
            quantity,
          }))
          .filter((item) => item.device);

        const monthlyTotal = items.reduce((sum, { device, quantity }) => sum + device.monthly_price * quantity, 0);
        const installationTotal = items.reduce((sum, { device, quantity }) => sum + device.installation_price * quantity, 0);

        return { ...plan, resolvedItems: items, monthlyTotal, installationTotal };
      }),
    [devices]
  );

  const handleSelectPlan = (plan) => {
    navigate('/adesao', {
      state: {
        preselect: { ...plan.items },
        planName: plan.name,
      },
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 shadow-lg shadow-blue-500/10 mb-5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-300 uppercase">
              Pacotes de Proteção
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
            Escolha o pacote{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
              ideal para a sua casa
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Pacotes prontos configurados pela equipe NexGuard para diferentes perfis de residência — ou monte o seu plano personalizado, dispositivo por dispositivo.
          </p>
        </header>

        {/* Grid de Planos */}
        <section id="pacotes" className="scroll-mt-24 mb-16">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-pulse">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl mx-auto mb-4" />
                  <div className="h-6 bg-slate-800 rounded w-1/2 mx-auto mb-3" />
                  <div className="h-3 bg-slate-800 rounded w-3/4 mx-auto mb-6" />
                  <div className="h-9 bg-slate-800 rounded w-2/3 mx-auto mb-6" />
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-5/6" />
                    <div className="h-3 bg-slate-800 rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/40 rounded-2xl p-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Não foi possível carregar os pacotes</h2>
              <p className="text-red-300 text-sm mb-6">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch pt-3.5">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  items={plan.resolvedItems}
                  monthlyTotal={plan.monthlyTotal}
                  installationTotal={plan.installationTotal}
                  highlighted={plan.highlighted}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>
          )}
        </section>

        {/* Opção de plano personalizado */}
        <section id="personalizado" className="scroll-mt-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600/15 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="p-4 bg-blue-600/20 rounded-2xl shrink-0">
              <SlidersHorizontal className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
                Prefere montar o seu próprio pacote?
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Crie um plano personalizado escolhendo cada dispositivo e quantidade, com os valores calculados em tempo real.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/adesao')}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 cursor-pointer text-sm"
            >
              <span>Criar Plano Personalizado</span>
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
