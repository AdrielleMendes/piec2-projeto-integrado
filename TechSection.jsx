import React, { useState } from 'react';
import { Camera, Radio, ShieldAlert, Cpu, Fingerprint, Wifi, CheckCircle2, ChevronRight } from 'lucide-react';

export default function TechSection() {
  const [activeTech, setActiveTech] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const technologies = [
    {
      id: "cameras",
      icon: <Camera className="w-5 h-5" />,
      title: "Câmeras UltraHD IA 4K",
      category: "Visão Preditiva",
      status: "Ativo • 60 FPS",
      description: "Equipadas com processamento neural na borda, identificam rostos, placas e comportamentos anômalos em tempo real, filtrando animais de estimação e mudanças climáticas.",
      specs: ["Visão Noturna Colorida (0.001 Lux)", "Zoom Óptico 12x", "Detecção de Perímetro Inteligente"]
    },
    {
      id: "perimetro",
      icon: <Radio className="w-5 h-5" />,
      title: "Sensores IVA de Perímetro",
      category: "Barreira Invisível",
      status: "Ativo • Feixes Duplos",
      description: "Barreiras fotoelétricas de infravermelho instaladas nos muros. Detectam intrusões antes mesmo que o invasor toque a estrutura física da residência.",
      specs: ["Alcance de até 100m", "Imunidade a disparos falsos", "Resposta de acionamento em < 5ms"]
    },
    {
      id: "vidro",
      icon: <ShieldAlert className="w-5 h-5" />,
      title: "Sensores de Impacto e Vidro",
      category: "Proteção de Janelas",
      status: "Ativo • Sensor Acústico",
      description: "Analisadores de frequência sonora calibrados para reconhecer a frequência exata de quebra de vidros temperados ou impactos estruturais em portas.",
      specs: ["Análise de padrão de onda sonora", "Cobertura de 360° em até 9m", "Bateria de longa duração (5 anos)"]
    },
    {
      id: "central",
      icon: <Cpu className="w-5 h-5" />,
      title: "Central NexCore Criptografada",
      category: "Hardware Central",
      status: "Operacional • Processador Criptográfico",
      description: "O cérebro autônomo da Safehouse. Processa todos os dados localmente com criptografia de nível militar (AES-256) e backup de bateria dedicado.",
      specs: ["Bateria de emergência (48h Uptime)", "Criptografia AES-256", "Armazenamento local redundante"]
    },
    {
      id: "acesso",
      icon: <Fingerprint className="w-5 h-5" />,
      title: "Fechaduras Biométricas & RFID",
      category: "Controle de Entrada",
      status: "Pronto • Múltiplos Acessos",
      description: "Controle de acesso multifator com leitura biométrica ultrassônica, senhas dinâmicas temporárias para visitantes e logs em tempo real.",
      specs: ["Leitura biométrica 3D (< 0.2s)", "Abertura por Tag RFID ou App", "Travamento eletromecânico duplo"]
    },
    {
      id: "rede",
      icon: <Wifi className="w-5 h-5" />,
      title: "Módulo Dual Path (GSM + Fibra)",
      category: "Conectividade Redundante",
      status: "Conectado • Link Duplo",
      description: "Garante que os sinais de alerta cheguem à central de monitoramento mesmo se a internet do imóvel for cortada ou se houver queda de energia.",
      specs: ["Chaveamento automático em milissegundos", "Chip M2M integrado", "Antena de alto ganho anti-jamming"]
    }
  ];

  const handleSelectTech = (index) => {
    if (index === activeTech) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTech(index);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <section 
      id="tecnologia" 
      className="py-20 sm:py-28 bg-slate-950 text-white relative overflow-hidden scroll-mt-16 min-h-screen flex flex-col justify-center"
    >
      
      {/* Luzes técnicas de fundo */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block px-3.5 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-400 font-semibold text-xs tracking-wider uppercase mb-3 backdrop-blur-md">
            Ecossistema de Hardware
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Engenharia de proteção para a sua casa mais segura
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Nossos módulos operam de forma integrada. Clique nos componentes para explorar a tecnologia de monitoramento em tempo real.
          </p>
        </div>

        {/* Interface de Seleção */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Menu Lateral */}
          <div className="lg:col-span-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
              Selecione o Módulo de Segurança
            </p>
            {technologies.map((tech, index) => {
              const isSelected = activeTech === index;
              return (
                <button
                  key={tech.id}
                  onClick={() => handleSelectTech(index)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-500/10 backdrop-blur-md"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-lg border transition-colors ${
                      isSelected 
                        ? "bg-blue-600 text-white border-blue-400" 
                        : "bg-slate-800/80 text-slate-400 border-slate-700/60"
                    }`}>
                      {tech.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base leading-tight">
                        {tech.title}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {tech.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? "text-blue-400 translate-x-1" : "text-slate-600"}`} />
                </button>
              );
            })}
          </div>

          {/* Painel com Transição */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden shadow-2xl">
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-transparent" />

            <div className={`transition-all duration-300 ease-out ${
              isAnimating 
                ? "opacity-0 translate-y-2 scale-[0.99]" 
                : "opacity-100 translate-y-0 scale-100"
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-mono rounded-full">
                  {technologies[activeTech].category}
                </span>
                <span className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {technologies[activeTech].status}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {technologies[activeTech].title}
              </h3>
              <p className="text-slate-300 text-base leading-relaxed mb-8 font-light">
                {technologies[activeTech].description}
              </p>

              <div className="border-t border-slate-800 pt-6">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Especificações do Módulo
                </h5>
                <ul className="space-y-3">
                  {technologies[activeTech].specs.map((spec, index) => (
                    <li key={index} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Módulo integrado ao app NexGuard</span>
              <span className="font-mono">SAFEHOUSE OS v4.2</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}