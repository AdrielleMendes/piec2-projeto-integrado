import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function ArduinoWidget() {
  const [dados, setDados] = useState({ temperatura: '0.0', umidade: '0.0', fumaca: 0, presenca: false });
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    const socket = io('COLE_O_SEU_LINK_AQUI');

    socket.on('connect', () => setConectado(true));
    socket.on('disconnect', () => setConectado(false));

    socket.on('sensorData', (data) => {
      setDados({
        temperatura: data.temperatura ?? '0.0',
        umidade: data.umidade ?? data.humidade ?? '0.0', 
        fumaca: data.fumaca ?? 0,
        presenca: data.presenca ?? false
      });
    });

    return () => socket.disconnect();
  }, []);

  const isFumacaAlta = dados.fumaca > 400;

  return (
    <div className="w-full bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">NexGuard - Telemetria ao Vivo</h2>
            <p className="text-slate-500 mt-2 text-lg">Monitorização de sensores em tempo real.</p>
          </div>
          <span className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide shadow-sm flex items-center gap-2 ${
            conectado 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${conectado ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {conectado ? 'Sistema Online' : 'Desconectado'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#0B1120] rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 z-10">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Temperatura</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto z-10">
              <span className="text-4xl font-mono text-white font-bold">{dados.temperatura}</span>
              <span className="text-xl text-slate-400">°C</span>
            </div>
          </div>

          <div className="bg-[#0B1120] rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 z-10">
              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Umidade</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto z-10">
              <span className="text-4xl font-mono text-white font-bold">{dados.umidade}</span>
              <span className="text-xl text-slate-400">%</span>
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl border flex flex-col relative overflow-hidden transition-colors duration-500 ${isFumacaAlta ? 'bg-red-950 border-red-900' : 'bg-[#0B1120] border-slate-800'}`}>
            <div className="flex items-center gap-3 mb-4 z-10">
              <div className={`p-2 rounded-lg ${isFumacaAlta ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              </div>
              <h3 className={`font-medium text-sm uppercase tracking-wider ${isFumacaAlta ? 'text-red-200' : 'text-slate-400'}`}>Fumaça / Gás</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto z-10">
              <span className={`text-4xl font-mono font-bold ${isFumacaAlta ? 'text-red-400' : 'text-white'}`}>{dados.fumaca}</span>
              <span className="text-xl text-slate-400">ppm</span>
            </div>
          </div>

          <div className="bg-[#0B1120] rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 z-10">
              <div className={`p-2 rounded-lg ${dados.presenca ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </div>
              <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Presença</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto z-10">
              <span className={`text-3xl font-bold ${dados.presenca ? 'text-emerald-400' : 'text-slate-500'}`}>
                {dados.presenca ? 'DETECTADO' : 'VAZIO'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}