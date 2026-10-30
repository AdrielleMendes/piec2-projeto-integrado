import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, PackageCheck } from 'lucide-react';
import DeviceCard from './components/DeviceCard';
import CartSummary from './components/CartSummary';
import AddressForm from './components/AddressForm';
import { fetchDevices, createOrder } from '../../services/api';
import { formatCurrency } from '../../utils/format';

export default function Adesao() {
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [devicesError, setDevicesError] = useState(null);

  // Mapa de seleção: { [deviceId]: quantidade }
  const [selection, setSelection] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const checkoutRef = useRef(null);

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true);
    setDevicesError(null);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (error) {
      setDevicesError(error.message);
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial: o estado de loading já começa ativo; as atualizações
    // de estado ocorrem apenas após o await (callback assíncrono).
    (async () => {
      try {
        const data = await fetchDevices();
        setDevices(data);
      } catch (error) {
        setDevicesError(error.message);
      } finally {
        setLoadingDevices(false);
      }
    })();
  }, []);

  // ===== Seleção de dispositivos =====

  const handleToggle = (device) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (next[device.id]) {
        delete next[device.id];
      } else {
        next[device.id] = 1;
      }
      return next;
    });
  };

  const handleQuantityChange = (device, quantity) => {
    if (quantity < 1 || quantity > 50) return;
    setSelection((prev) => ({ ...prev, [device.id]: quantity }));
  };

  // ===== Totais em tempo real =====

  const selectedItems = useMemo(
    () =>
      devices
        .filter((device) => selection[device.id])
        .map((device) => ({ device, quantity: selection[device.id] })),
    [devices, selection]
  );

  const { monthlyTotal, installationTotal } = useMemo(
    () =>
      selectedItems.reduce(
        (totals, { device, quantity }) => ({
          monthlyTotal: totals.monthlyTotal + device.monthly_price * quantity,
          installationTotal: totals.installationTotal + device.installation_price * quantity,
        }),
        { monthlyTotal: 0, installationTotal: 0 }
      ),
    [selectedItems]
  );

  // ===== Submissão do pedido =====

  const handleSubmit = async (customerData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        ...customerData,
        items: selectedItems.map(({ device, quantity }) => ({
          device_id: device.id,
          quantity,
        })),
      });
      setCompletedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCompletedOrder(null);
    setSelection({});
    setSubmitError(null);
  };

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ===== Tela de sucesso =====

  if (completedOrder) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 sm:p-14">
            <div className="mx-auto w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-9 h-9 text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Adesão confirmada!
            </h1>
            <p className="text-slate-400 leading-relaxed mb-8">
              O pedido <span className="text-white font-semibold">#{completedOrder.id}</span> foi recebido com sucesso.
              A equipe NexGuard entrará em contato para agendar a instalação.
            </p>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-8 text-left space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400 font-semibold">{completedOrder.status}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Instalação (única)</span>
                <span className="text-slate-200 font-medium">{formatCurrency(completedOrder.installation_total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Assinatura mensal</span>
                <span className="text-blue-400 font-bold text-lg">{formatCurrency(completedOrder.monthly_total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 cursor-pointer text-sm"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Nova Adesão</span>
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 transition-all duration-300 cursor-pointer text-sm"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ===== Página principal =====

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 shadow-lg shadow-blue-500/10 mb-5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-300 uppercase">
              Adesão de Dispositivos
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
            Monte o pacote de proteção{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
              ideal para a sua casa
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Selecione e configure os dispositivos para a sua proteção. Os valores são calculados em tempo real e a instalação é realizada pela equipe técnica NexGuard.
          </p>
        </header>

        {/* Catálogo de Dispositivos */}
        <section id="catalogo" className="scroll-mt-24 mb-16">
          {loadingDevices ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
                  <div className="w-16 h-16 bg-slate-800 rounded-xl mb-5" />
                  <div className="h-5 bg-slate-800 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-800 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-5/6 mb-5" />
                  <div className="h-6 bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : devicesError ? (
            <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/40 rounded-2xl p-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Não foi possível carregar o catálogo</h2>
              <p className="text-red-300 text-sm mb-6">{devicesError}</p>
              <button
                type="button"
                onClick={loadDevices}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  selected={Boolean(selection[device.id])}
                  quantity={selection[device.id] ?? 1}
                  onToggle={handleToggle}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          )}
        </section>

        {/* Resumo + Formulário */}
        <section id="finalizar" ref={checkoutRef} className="scroll-mt-24 grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <AddressForm
              onSubmit={handleSubmit}
              submitting={submitting}
              serverError={submitError}
              hasItems={selectedItems.length > 0}
            />
          </div>
          <CartSummary
            items={selectedItems}
            monthlyTotal={monthlyTotal}
            installationTotal={installationTotal}
            onRemove={handleToggle}
            onCheckout={scrollToCheckout}
          />
        </section>

      </div>
    </main>
  );
}
