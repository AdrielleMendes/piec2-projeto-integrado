import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BatteryMedium,
  Camera,
  Cctv,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  DoorClosed,
  Home,
  LayoutDashboard,
  LockKeyhole,
  Pause,
  Play,
  Radio,
  ScanLine,
  Shield,
  ShieldCheck,
  Siren,
  UnlockKeyhole,
  Wifi,
  X,
} from 'lucide-react';
import CameraCard from './components/CameraCard';
import SensorRow from './components/SensorRow';
import { buildDashboardData, INITIAL_EVENTS } from './data';

const NAV_ITEMS = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'cameras', label: 'Câmeras', icon: Cctv },
  { id: 'devices', label: 'Dispositivos', icon: Radio },
];

const VIEW_TITLES = {
  overview: 'Visão geral',
  cameras: 'Câmeras da residência',
  devices: 'Dispositivos conectados',
};

function NavButton({ item, active, onClick, mobile = false }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      aria-current={active ? 'page' : undefined}
      className={`${
        mobile
          ? 'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs'
          : 'flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm'
      } font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      <Icon className={mobile ? 'h-4 w-4' : 'h-5 w-5'} />
      <span>{item.label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  const toneClasses = tone === 'green' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-blue-400/10 text-blue-300';
  return (
    <article className="min-w-0 rounded-2xl border border-white/[0.07] bg-[var(--nx-panel)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 truncate text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function EmptyState({ type }) {
  const isCamera = type === 'camera';
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
      {isCamera ? <Cctv className="mx-auto h-8 w-8 text-slate-500" /> : <Radio className="mx-auto h-8 w-8 text-slate-500" />}
      <h3 className="mt-4 text-base font-bold text-white">Nenhum {isCamera ? 'câmera instalada' : 'sensor instalado'}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
        Adicione este equipamento à sua adesão para acompanhar o status por aqui.
      </p>
      <Link
        to="/adesao"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        Adicionar dispositivo
      </Link>
    </div>
  );
}

function OtherDeviceRow({ device, locked, sirenArmed, onToggleLock, onToggleSiren }) {
  const Icon = device.type === 'lock' ? LockKeyhole : device.type === 'siren' ? Siren : Cpu;
  const isControllable = device.type === 'lock' || device.type === 'siren';
  const status = device.type === 'lock' ? (locked ? 'Trancada' : 'Destrancada') : device.type === 'siren' ? (sirenArmed ? 'Armada' : 'Desarmada') : 'Online';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[var(--nx-panel)] p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{device.name}</h3>
          <p className="mt-1 truncate text-xs text-slate-400">{device.model}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {status}
          </p>
        </div>
      </div>
      {isControllable && (
        <button
          type="button"
          onClick={device.type === 'lock' ? onToggleLock : onToggleSiren}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
        >
          {device.type === 'lock' ? (locked ? <UnlockKeyhole className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />) : <Siren className="h-4 w-4" />}
          {device.type === 'lock' ? (locked ? 'Destrancar' : 'Trancar') : sirenArmed ? 'Desarmar' : 'Armar'}
        </button>
      )}
      {!isControllable && <BatteryMedium className="hidden h-5 w-5 text-slate-600 sm:block" />}
    </div>
  );
}

export default function Central() {
  const location = useLocation();
  const { cameras, sensors, otherDevices } = useMemo(
    () => buildDashboardData(location.state?.selectedDevices),
    [location.state?.selectedDevices]
  );

  const [activeView, setActiveView] = useState('overview');
  const [mode, setMode] = useState('home');
  const [locked, setLocked] = useState(true);
  const [sirenArmed, setSirenArmed] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [streamPaused, setStreamPaused] = useState(false);
  const [toast, setToast] = useState('');
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const customerName = location.state?.customerName?.split(' ')[0] ?? 'João';
  const hasLock = otherDevices.some((device) => device.type === 'lock');
  const currentDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  useEffect(() => {
    if (!selectedCamera) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedCamera(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedCamera]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const addEvent = (title, type = 'system') => {
    setEvents((current) => [{ id: Date.now(), title, time: 'Agora', type }, ...current].slice(0, 5));
  };

  const handleModeChange = (nextMode) => {
    if (mode === nextMode) return;
    setMode(nextMode);
    addEvent(nextMode === 'away' ? 'Modo Ausente ativado' : 'Modo Em Casa ativado', 'system');
  };

  const handleToggleLock = () => {
    const nextLocked = !locked;
    setLocked(nextLocked);
    addEvent(nextLocked ? 'Porta principal trancada' : 'Porta principal destrancada', 'door');
    setToast(nextLocked ? 'Porta principal trancada com segurança.' : 'Porta principal destrancada.');
  };

  const handleToggleSiren = () => {
    const nextArmed = !sirenArmed;
    setSirenArmed(nextArmed);
    addEvent(nextArmed ? 'Sirene externa armada' : 'Sirene externa desarmada', 'system');
    setToast(nextArmed ? 'Sirene externa armada.' : 'Sirene externa desarmada.');
  };

  const handleOpenCamera = (camera) => {
    setStreamPaused(false);
    setSelectedCamera(camera);
  };

  const changeView = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    { icon: Cctv, label: 'Câmeras online', value: `${cameras.length}/${cameras.length}`, detail: 'Transmissão estável', tone: 'blue' },
    { icon: ScanLine, label: 'Sensores ativos', value: `${sensors.length}/${sensors.length}`, detail: 'Todos respondendo', tone: 'green' },
    { icon: LockKeyhole, label: 'Acesso principal', value: hasLock ? (locked ? 'Trancado' : 'Aberto') : '—', detail: hasLock ? 'Fechadura inteligente' : 'Não instalado', tone: locked ? 'green' : 'blue' },
    { icon: Wifi, label: 'Central conectada', value: 'Online', detail: 'Rede principal · 4G', tone: 'green' },
  ];

  return (
    <div className="min-h-dvh bg-[var(--nx-bg)] text-slate-200 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-white/[0.07] bg-[var(--nx-sidebar)] px-4 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 px-2 text-xl font-extrabold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Shield className="h-5 w-5" />
          </span>
          Nex<span className="-ml-2.5 text-blue-400">Guard</span>
        </Link>

        <div className="mx-2 mt-8 border-y border-white/[0.07] py-5">
          <p className="text-xs font-medium text-slate-500">RESIDÊNCIA CONECTADA</p>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Home className="h-4 w-4 text-blue-300" />
            Minha casa
          </div>
        </div>

        <nav className="mt-6 space-y-1.5" aria-label="Navegação da central">
          {NAV_ITEMS.map((item) => (
            <NavButton key={item.id} item={item} active={activeView === item.id} onClick={changeView} />
          ))}
        </nav>

        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Sistema operacional
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">Monitoramento NexGuard ativo 24 horas.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-white/[0.07] px-2 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-blue-300">{customerName.charAt(0)}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{customerName}</p>
              <p className="text-xs text-slate-500">Conta do cliente</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[var(--nx-bg)]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link to="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white lg:hidden" aria-label="Ir para o início">
                <Shield className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <p className="hidden text-xs capitalize text-slate-500 sm:block">{currentDate}</p>
                <h1 className="truncate text-lg font-bold text-white sm:mt-0.5 sm:text-xl">{VIEW_TITLES[activeView]}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Atualizado agora
              </div>
              <Link
                to="/adesao"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-4 sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Minha adesão</span>
                <span className="sm:hidden">Adesão</span>
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-blue-300 lg:hidden">{customerName.charAt(0)}</div>
            </div>
          </div>
          <nav className="flex gap-1 px-3 pb-3 lg:hidden" aria-label="Navegação da central móvel">
            {NAV_ITEMS.map((item) => (
              <NavButton key={item.id} item={item} active={activeView === item.id} onClick={changeView} mobile />
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
          <section className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-[var(--nx-security)] p-5 sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 sm:h-14 sm:w-14">
                <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Residência protegida</p>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {mode === 'away' ? 'Proteção total ativada' : 'Perímetro monitorado'}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                  {mode === 'away'
                    ? 'Câmeras, sensores de movimento e acessos estão monitorando qualquer atividade.'
                    : 'Os acessos estão protegidos e os sensores internos permitem sua circulação.'}
                </p>
              </div>
            </div>
            <div className="relative mt-5 flex rounded-xl border border-white/10 bg-slate-950/50 p-1 lg:mt-0 lg:shrink-0" role="group" aria-label="Modo de segurança">
              <button
                type="button"
                onClick={() => handleModeChange('home')}
                aria-pressed={mode === 'home'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer lg:flex-none ${mode === 'home' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Home className="h-4 w-4" /> Em casa
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('away')}
                aria-pressed={mode === 'away'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer lg:flex-none ${mode === 'away' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Shield className="h-4 w-4" /> Ausente
              </button>
            </div>
          </section>

          {activeView === 'overview' && (
            <>
              <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Resumo dos dispositivos">
                {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
              </section>

              <div className="mt-8 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
                <div className="min-w-0 space-y-8">
                  <section>
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-white">Câmeras ao vivo</h2>
                        <p className="mt-1 text-sm text-slate-400">Acompanhe os ambientes em tempo real.</p>
                      </div>
                      {cameras.length > 0 && (
                        <button type="button" onClick={() => changeView('cameras')} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-blue-300 transition hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer">
                          Ver todas <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {cameras.length ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {cameras.slice(0, 4).map((camera) => <CameraCard key={camera.id} camera={camera} onOpen={handleOpenCamera} />)}
                      </div>
                    ) : <EmptyState type="camera" />}
                  </section>
                </div>

                <div className="min-w-0 space-y-6">
                  <section className="rounded-2xl border border-white/[0.07] bg-[var(--nx-panel)] p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-white">Status dos sensores</h2>
                        <p className="mt-1 text-xs text-slate-500">Leituras mais recentes</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    </div>
                    {sensors.length ? (
                      <>
                        <div className="divide-y divide-white/[0.06]">
                          {sensors.slice(0, 4).map((sensor) => <SensorRow key={sensor.id} sensor={sensor} />)}
                        </div>
                        <button type="button" onClick={() => changeView('devices')} className="mt-5 flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer">
                          Ver todos os dispositivos <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : <EmptyState type="sensor" />}
                  </section>

                  <section className="rounded-2xl border border-white/[0.07] bg-[var(--nx-panel)] p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-300" />
                      <h2 className="text-base font-bold text-white">Atividade recente</h2>
                    </div>
                    <ol className="space-y-5">
                      {events.slice(0, 4).map((event) => (
                        <li key={event.id} className="flex gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                            {event.type === 'door' ? <DoorClosed className="h-4 w-4" /> : event.type === 'motion' ? <ScanLine className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug text-slate-200">{event.title}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3 w-3" />{event.time}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              </div>
            </>
          )}

          {activeView === 'cameras' && (
            <section className="mt-8">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Monitoramento em tempo real</h2>
                  <p className="mt-1 text-sm text-slate-400">Selecione uma câmera para ampliar a transmissão.</p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />{cameras.length} câmeras online</span>
              </div>
              {cameras.length ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {cameras.map((camera) => <CameraCard key={camera.id} camera={camera} onOpen={handleOpenCamera} large />)}
                </div>
              ) : <EmptyState type="camera" />}
            </section>
          )}

          {activeView === 'devices' && (
            <div className="mt-8 grid min-w-0 gap-8 xl:grid-cols-2">
              <section>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-white">Sensores instalados</h2>
                  <p className="mt-1 text-sm text-slate-400">Status, leituras e nível de bateria.</p>
                </div>
                {sensors.length ? (
                  <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-[var(--nx-panel)] px-5 py-2">
                    {sensors.map((sensor) => <SensorRow key={sensor.id} sensor={sensor} showBattery />)}
                  </div>
                ) : <EmptyState type="sensor" />}
              </section>
              <section>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-white">Controles e conectividade</h2>
                  <p className="mt-1 text-sm text-slate-400">Gerencie os equipamentos da residência.</p>
                </div>
                {otherDevices.length ? (
                  <div className="space-y-3">
                    {otherDevices.map((device) => (
                      <OtherDeviceRow key={device.id} device={device} locked={locked} sirenArmed={sirenArmed} onToggleLock={handleToggleLock} onToggleSiren={handleToggleSiren} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-10 text-center text-sm text-slate-400">Nenhum controle adicional instalado.</div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {selectedCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
          <button type="button" className="absolute inset-0 cursor-default bg-slate-950/85 backdrop-blur-sm" onClick={() => setSelectedCamera(null)} aria-label="Fechar detalhes da câmera" />
          <div className="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-[var(--nx-panel)] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] p-4 sm:px-6">
              <div className="min-w-0">
                <h2 id="camera-modal-title" className="truncate text-lg font-bold text-white">{selectedCamera.name}</h2>
                <p className="mt-1 truncate text-xs text-slate-400">{selectedCamera.model}</p>
              </div>
              <button type="button" autoFocus onClick={() => setSelectedCamera(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative aspect-video bg-slate-950">
              <img src={selectedCamera.image} alt={`Transmissão ampliada da câmera ${selectedCamera.name}`} className={`h-full w-full object-cover transition ${streamPaused ? 'opacity-40 grayscale' : ''}`} />
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                <span className={`h-2 w-2 rounded-full ${streamPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {streamPaused ? 'PAUSADO' : 'AO VIVO'}
              </span>
              {streamPaused && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl bg-slate-950/75 p-4 text-white backdrop-blur-md"><Pause className="h-8 w-8" /></div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-sm font-semibold text-slate-200">{selectedCamera.location}</p>
                <p className="mt-1 text-xs text-slate-500">{selectedCamera.lastEvent}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={() => setStreamPaused((paused) => !paused)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer">
                  {streamPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {streamPaused ? 'Retomar' : 'Pausar'}
                </button>
                <button type="button" onClick={() => setToast('Captura registrada no histórico desta demonstração.')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer">
                  <Camera className="h-4 w-4" /> Capturar imagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-400/25 bg-slate-900 px-4 py-3.5 text-sm font-medium text-slate-100 shadow-2xl" role="status">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
          {toast}
        </div>
      )}
    </div>
  );
}
