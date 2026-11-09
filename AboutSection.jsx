import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AboutSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      type: "stats",
      badge: "Lares Protegidos",
      value: "+15.000",
      description: "Famílias e residências monitoradas 24 horas por dia com tranquilidade absoluta.",
      bgImage: "/safehouse.webp"
    },
    {
      type: "stats",
      badge: "Tempo de Resposta",
      value: "< 10s",
      description: "Agilidade na verificação de alertas e acionamento de protocolos de emergência residencial.",
      bgImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop"
    },
    {
      type: "stats",
      badge: "Confiabilidade",
      value: "99.9%",
      description: "Sistemas redundantes de energia e sinal para manter sua casa segura mesmo sem internet.",
      bgImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const highlights = [
    "Monitoramento perimetral e interno em tempo real.",
    "Sensores inteligentes anti-intrusão e detecção de movimento.",
    "Suporte técnico especializado e atendimento 24/7.",
    "Integração completa com dispositivos de automação residencial."
  ];

  return (
    <section id="sobre" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Lado Esquerdo: Texto Institucional Residencial */}
        <div>
          <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">
            A NexGuard
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-6 leading-tight">
            Sua casa protegida por quem entende de segurança familiar
          </h2>
          <p className="text-slate-600 text-lg mb-6 leading-relaxed">
            A NexGuard desenvolve soluções focadas na proteção da sua Safehouse. Combinamos inteligência artificial e monitoramento ativo para criar uma blindagem invisível e eficiente para o seu lar.
          </p>
          
          <ul className="space-y-3 mb-8">
            {highlights.map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lado Direito: Card Quadrado Reduzido */}
        <div className="w-full flex justify-center">
          <div className="relative aspect-square w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-900 group">
            
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${slide.bgImage}')` }}
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/80 to-slate-900/40 backdrop-blur-[1px]" />

                {/* Conteúdo ajustado para o tamanho compacto */}
                <div className="relative z-20 h-full p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 font-medium text-xs tracking-wider uppercase backdrop-blur-md">
                      {slide.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      {slide.value}
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Controles do Carrossel */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/60 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 cursor-pointer"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/60 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 cursor-pointer"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide 
                      ? "w-6 bg-blue-500" 
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}