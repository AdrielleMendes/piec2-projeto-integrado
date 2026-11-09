import React from 'react';
import { Shield, Eye, Smartphone, HeadphoneOff } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />,
      title: "Proteção Perimetral",
      description: "Barreiras de infravermelho e câmeras inteligentes que identificam movimentações suspeitas nos limites do seu terreno."
    },
    {
      icon: <Eye className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />,
      title: "Monitoramento 24h",
      description: "Monitoramento por imagem de alta resolução com reconhecimento de presença e visão noturna avançada."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />,
      title: "Controle Mobile",
      description: "Arme, desarme e visualize todas as câmeras e fechaduras da sua casa em tempo real pelo aplicativo."
    },
    {
      icon: <HeadphoneOff className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />,
      title: "Pronta Resposta",
      description: "Central de atendimento pronta para agir e notificar em casos de emergência confirmada."
    }
  ];

  return (
    <section id="servicos" className="py-24 bg-slate-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-xs tracking-wider uppercase bg-blue-100 px-3.5 py-1.5 rounded-full">
            Nossos Serviços
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 mb-4 tracking-tight">
            Soluções completas de segurança para o seu lar
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Tecnologia avançada integrada para garantir a tranquilidade e a proteção contínua da sua família.
          </p>
        </div>

        {/* Grid de Cards com Centralização Forçada e Animação de Hover */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col items-center !text-center cursor-pointer"
            >
              {/* Contêiner do Ícone Centralizado */}
              <div className="p-3.5 bg-blue-50 group-hover:bg-blue-600/10 rounded-xl mb-6 !mx-auto flex items-center justify-center transition-colors duration-300">
                {service.icon}
              </div>

              {/* Título Centralizado */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 !text-center w-full">
                {service.title}
              </h3>

              {/* Descrição Centralizada */}
              <p className="text-slate-600 text-sm leading-relaxed !text-center w-full">
                {service.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}