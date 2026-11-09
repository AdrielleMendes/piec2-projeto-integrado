import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, DoorClosed, DoorOpen, LockKeyhole, LogIn, LogOut, ShieldCheck, ShieldX, Trash2, UserPlus, Users, RefreshCw, AlertTriangle } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function readError(response) {
  try {
    const body = await response.json();
    return body.detail || body.message || `Erro HTTP ${response.status}`;
  } catch {
    return `Erro HTTP ${response.status}`;
  }
}

export default function AccessControlPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem('nexguard_admin_token') || '');
  const [password, setPassword] = useState('');
  const [people, setPeople] = useState([]);
  const [events, setEvents] = useState([]);
  const [health, setHealth] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', accessPin: '', consent: false });
  const [scanPin, setScanPin] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(await readError(response));
    if (response.status === 204) return null;
    return response.json();
  }, [token]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const [peopleData, eventsData, healthData] = await Promise.all([
        request('/api/v1/people'),
        request('/api/v1/access/events?limit=30'),
        fetch(`${API_URL}/health`).then((response) => response.json()),
      ]);
      setPeople(peopleData);
      setEvents(eventsData);
      setHealth(healthData);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      if (error.message.includes('Sessão')) logout();
    }
  }, [token, request]);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  function logout() {
    stopCamera();
    sessionStorage.removeItem('nexguard_admin_token');
    setToken('');
    setPeople([]);
    setEvents([]);
    setMessage(null);
  }

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      sessionStorage.setItem('nexguard_admin_token', data.access_token);
      setToken(data.access_token);
      setPassword('');
      setMessage({ type: 'success', text: 'Sessão administrativa iniciada.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function startCamera() {
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setMessage({ type: 'error', text: 'Não foi possível acessar a câmera. Verifique a permissão do navegador e use HTTPS ou localhost.' });
    }
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (!video || !streamRef.current || video.readyState < 2) {
      throw new Error('Inicie a câmera e aguarde a imagem aparecer.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d', { willReadFrequently: false });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg', 0.9);
    // O canvas temporário é limpo e a captura não é adicionada ao DOM nem salva em arquivo.
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1;
    canvas.height = 1;
    return image;
  }

  async function enroll(event) {
    event.preventDefault();
    if (!form.consent) {
      setMessage({ type: 'error', text: 'Confirme que a pessoa foi informada e autorizou o cadastro biométrico.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    let image = null;
    try {
      image = await captureFrame();
      const data = await request('/api/v1/people/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          access_pin: form.accessPin,
          consent_confirmed: form.consent,
          image_base64: image,
        }),
      });
      setMessage({ type: 'success', text: `${data.name} foi cadastrado e autorizado.` });
      setForm({ name: '', email: '', accessPin: '', consent: false });
      await refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      image = null;
      stopCamera();
      setBusy(false);
    }
  }

  async function testAccess() {
    setBusy(true);
    setMessage(null);
    let image = null;
    try {
      image = await captureFrame();
      const result = await request('/api/v1/access/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: image, access_pin: scanPin || null }),
      });
      setMessage({ type: result.authorized ? 'success' : 'error', text: result.message });
      await refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      image = null;
      stopCamera();
      setBusy(false);
    }
  }

  async function setAuthorization(person) {
    try {
      await request(`/api/v1/people/${person.id}/authorization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorized: !person.authorized }),
      });
      setMessage({ type: 'success', text: person.authorized ? 'Acesso da pessoa bloqueado.' : 'Acesso da pessoa autorizado.' });
      await refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  async function deletePerson(person) {
    if (!window.confirm(`Remover ${person.name} e seu modelo biométrico?`)) return;
    try {
      await request(`/api/v1/people/${person.id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Cadastro e modelo biométrico removidos.' });
      await refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }

  return (
    <section id="controle-acesso" className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <ShieldCheck size={15} /> NexGuard Access
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Controle de acesso</h2>
            <p className="mt-2 max-w-2xl text-slate-400">Cadastre pessoas autorizadas, valide o acesso pela câmera e acompanhe os eventos. As capturas não são arquivadas.</p>
          </div>
          {token && (
            <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">
              <LogOut size={16} /> Sair do painel
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/40 bg-rose-500/10 text-rose-200'}`} role="status">
            {message.text}
          </div>
        )}

        {!token ? (
          <form onSubmit={login} className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300"><LockKeyhole size={22} /></div>
              <div><h3 className="text-lg font-bold">Acesso administrativo</h3><p className="text-sm text-slate-400">Entre com a chave administrativa configurada no servidor.</p></div>
            </div>
            <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="admin-password">Chave administrativa</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            <button disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"><LogIn size={17} /> Entrar</button>
          </form>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pessoas cadastradas</p>
                <p className="mt-2 text-3xl font-bold">{people.length}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modelos de reconhecimento</p>
                <p className={`mt-2 text-lg font-bold ${health?.models_ready ? 'text-emerald-300' : 'text-amber-300'}`}>{health?.models_ready ? 'Prontos' : 'Modelos ausentes'}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fechadura física</p>
                <p className={`mt-2 text-lg font-bold ${health?.physical_unlock_enabled && health?.trusted_liveness_configured ? 'text-emerald-300' : 'text-amber-300'}`}>{!health?.physical_unlock_enabled ? 'Desabilitada (simulação)' : (health?.trusted_liveness_configured ? 'Via dispositivo confiável' : 'Aguardando liveness')}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div><h3 className="flex items-center gap-2 text-lg font-bold"><Camera size={19} className="text-cyan-300" /> Câmera da porta</h3><p className="mt-1 text-sm text-slate-400">A captura é temporária e enviada somente para processamento.</p></div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cameraOn ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{cameraOn ? 'Ativa' : 'Desligada'}</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-700 bg-black">
                    <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!cameraOn ? (
                      <button onClick={startCamera} type="button" className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400"><Camera size={16} /> Ligar câmera</button>
                    ) : (
                      <button onClick={stopCamera} type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"><CameraOff size={16} /> Desligar câmera</button>
                    )}
                    <button onClick={refresh} type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"><RefreshCw size={16} /> Atualizar dados</button>
                  </div>
                  <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
                    <AlertTriangle size={15} className="mr-1 inline" /> O reconhecimento facial precisa ser validado em condições reais. Esta versão exige também o PIN pessoal para qualquer tentativa de abertura física.
                  </div>
                </div>

                <form onSubmit={enroll} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><UserPlus size={19} className="text-cyan-300" /> Cadastrar pessoa autorizada</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><label className="mb-1 block text-xs font-medium text-slate-400">Nome completo</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} minLength={2} required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" /></div>
                    <div><label className="mb-1 block text-xs font-medium text-slate-400">E-mail (opcional)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" /></div>
                    <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-slate-400">PIN pessoal (4 a 8 números)</label><input type="password" inputMode="numeric" pattern="[0-9]{4,8}" maxLength={8} value={form.accessPin} onChange={(e) => setForm({ ...form, accessPin: e.target.value.replace(/\D/g, '') })} required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" /></div>
                  </div>
                  <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-400"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 accent-cyan-400" /> Confirmo que a pessoa foi informada sobre o tratamento biométrico e autorizou o cadastro para controle de acesso.</label>
                  <button disabled={busy || !cameraOn || !form.name || form.accessPin.length < 4 || !form.consent} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"><UserPlus size={16} /> Capturar rosto e cadastrar</button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><DoorOpen size={19} className="text-cyan-300" /> Testar autorização</h3>
                  <p className="mb-4 text-sm text-slate-400">Com a câmera ativa, capture o rosto e informe o PIN pessoal da pessoa cadastrada.</p>
                  <label className="mb-1 block text-xs font-medium text-slate-400">PIN pessoal</label>
                  <input type="password" inputMode="numeric" pattern="[0-9]{4,8}" maxLength={8} value={scanPin} onChange={(e) => setScanPin(e.target.value.replace(/\D/g, ''))} placeholder="PIN de quem está na porta" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
                  <button onClick={testAccess} disabled={busy || !cameraOn || scanPin.length < 4} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"><ShieldCheck size={17} /> Verificar e autorizar</button>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-bold"><Users size={19} className="text-cyan-300" /> Pessoas</h3><span className="text-xs text-slate-500">{people.filter((p) => p.authorized).length} autorizadas</span></div>
                  {people.length === 0 ? <p className="rounded-lg bg-slate-950 p-4 text-sm text-slate-500">Nenhuma pessoa cadastrada.</p> : (
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                      {people.map((person) => (
                        <div key={person.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                          <div className="min-w-0"><p className="truncate text-sm font-semibold">{person.name}</p><p className="truncate text-xs text-slate-500">{person.email || 'Sem e-mail'}</p><span className={`mt-1 inline-block text-xs font-semibold ${person.authorized ? 'text-emerald-300' : 'text-rose-300'}`}>{person.authorized ? 'Autorizada' : 'Bloqueada'}</span></div>
                          <div className="flex shrink-0 gap-1"><button title={person.authorized ? 'Bloquear acesso' : 'Autorizar acesso'} onClick={() => setAuthorization(person)} className="rounded-md border border-slate-700 p-2 hover:bg-slate-800">{person.authorized ? <ShieldX size={15} /> : <ShieldCheck size={15} />}</button><button title="Remover cadastro" onClick={() => deletePerson(person)} className="rounded-md border border-slate-700 p-2 text-rose-300 hover:bg-slate-800"><Trash2 size={15} /></button></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><LockKeyhole size={19} className="text-cyan-300" /> Histórico recente</h3>
                  {events.length === 0 ? <p className="rounded-lg bg-slate-950 p-4 text-sm text-slate-500">Nenhum evento registrado.</p> : (
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 p-3">
                          <div className="min-w-0"><p className="truncate text-sm font-semibold">{event.person_name || (event.decision === 'denied' ? 'Visitante não autorizado' : 'Verificação')}</p><p className="text-xs text-slate-500">{new Date(`${event.created_at.replace(' ', 'T')}Z`).toLocaleString()}</p><p className="text-xs text-slate-500">{event.reason.replaceAll('_', ' ')}</p></div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${event.decision === 'granted' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{event.decision === 'granted' ? (event.door_opened ? 'ABERTA' : 'AUTORIZADO') : 'NEGADO'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-slate-500"><DoorClosed size={14} /> Por segurança, falhas de câmera, reconhecimento, PIN ou comunicação mantêm a porta trancada.</p>
          </>
        )}
      </div>
    </section>
  );
}
