import React from 'react';
import { ChevronRight, Headset, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-white pt-24 pb-16 overflow-hidden">
      
      {/* Imagem de Fundo safehouse.webp com Tratamento Harmônico */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/safehouse.webp" 
          alt="Segurança Residencial NexGuard" 
          className="w-full h-full object-cover blur-[2px] scale-105"
        />
        {/* Overlay em gradiente radial e escuro para integrar a imagem à paleta slate/blue */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
        
        {/* Badge Corporativa Integrada à Paleta */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 backdrop-blur-md shadow-lg shadow-blue-500/10">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-300 uppercase">
            Ecossistema de Segurança Residencial
          </span>
        </div>

        {/* Título com Destaques na Paleta Azul/Ciano */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white drop-shadow-lg">
            Proteção de alta precisão para o seu{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
              patrimônio e família.
            </span>
          </h1>

          {/* Subtítulo Harmônico */}
          <p className="text-slate-200 text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed pt-2 drop-shadow-md">
            Gestão preventiva, monitoramento autônomo em tempo real e resposta técnica imediata integrada em uma única plataforma.
          </p>
        </div>

        {/* Grupo de Botões Padronizados */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          
          {/* Botão Principal: Azul Primário NexGuard */}
          <a
            href="#contato"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 cursor-pointer text-sm"
          >
            <span>Proteger Minha Casa</span>
            <ChevronRight className="w-4 h-4" />
          </a>

          {/* Botão Secundário: Slate Escuro com Bordas em Azul Sutil */}
          <a
            href="#contato"
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all duration-300 backdrop-blur-md cursor-pointer text-sm shadow-md"
          >
            Fale Conosco
          </a>

          {/* Botão Suporte: Azul Translúcido */}
          <a
            href="/suporte"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-400/30 hover:border-blue-400/60 font-semibold rounded-xl transition-all duration-300 backdrop-blur-md cursor-pointer text-sm"
          >
            <Headset className="w-4 h-4 text-blue-400" />
            <span>Área de Suporte</span>
          </a>

        </div>

      </div>
    </section>
  );
}