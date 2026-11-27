export const DEFAULT_CAMERAS = [
  {
    id: 'camera-entrada',
    name: 'Entrada principal',
    location: 'Fachada · Externa',
    image: '/cameras/entrada.jpg',
    model: 'NexGuard NX-Cam 4K',
    status: 'online',
    lastEvent: 'Nenhum movimento detectado',
  },
  {
    id: 'camera-sala',
    name: 'Sala de estar',
    location: 'Piso térreo · Interna',
    image: '/cameras/sala.jpg',
    model: 'NexGuard Dome 360°',
    status: 'online',
    lastEvent: 'Movimento detectado há 12 min',
  },
  {
    id: 'camera-cozinha',
    name: 'Cozinha',
    location: 'Piso térreo · Interna',
    image: '/cameras/garagem.jpg',
    model: 'NexGuard Dome 360°',
    status: 'online',
    lastEvent: 'Nenhum movimento detectado',
  },
  {
    id: 'camera-fundos',
    name: 'Fundos',
    location: 'Área externa · Externa',
    image: '/cameras/fundos.jpg',
    model: 'NexGuard NX-Cam 4K',
    status: 'online',
    lastEvent: 'Nenhum movimento detectado',
  },
];

export const DEFAULT_SENSORS = [
  {
    id: 'sensor-porta',
    name: 'Porta de entrada',
    model: 'Sensor de abertura',
    icon: 'door',
    status: 'Fechada',
    detail: 'Atualizado agora',
    battery: 96,
    tone: 'safe',
  },
  {
    id: 'sensor-movimento',
    name: 'Sala de estar',
    model: 'Sensor de movimento',
    icon: 'motion',
    status: 'Sem movimento',
    detail: 'Último evento há 12 min',
    battery: 88,
    tone: 'safe',
  },
  {
    id: 'sensor-janela',
    name: 'Janela da cozinha',
    model: 'Sensor de abertura',
    icon: 'door',
    status: 'Fechada',
    detail: 'Atualizado agora',
    battery: 91,
    tone: 'safe',
  },
  {
    id: 'sensor-fumaca',
    name: 'Cozinha',
    model: 'Detector de fumaça e gás',
    icon: 'smoke',
    status: 'Ar normal',
    detail: 'Nenhum risco identificado',
    battery: 94,
    tone: 'safe',
  },
  {
    id: 'sensor-temperatura',
    name: 'Ambiente interno',
    model: 'Sensor de temperatura',
    icon: 'temperature',
    status: '23 °C',
    detail: 'Umidade relativa de 54%',
    battery: 89,
    tone: 'neutral',
  },
  {
    id: 'sensor-garagem',
    name: 'Garagem',
    model: 'Sensor de movimento',
    icon: 'motion',
    status: 'Sem movimento',
    detail: 'Último evento há 48 min',
    battery: 85,
    tone: 'safe',
  },
];

export const DEFAULT_OTHER_DEVICES = [
  { id: 'lock', name: 'Porta principal', model: 'Fechadura Inteligente NX-Lock', type: 'lock', online: true },
  { id: 'hub', name: 'Central da residência', model: 'Central de Alarme NX-Hub', type: 'hub', online: true },
  { id: 'siren', name: 'Sirene externa', model: 'Sirene NX-Siren', type: 'siren', online: true },
];

export const INITIAL_EVENTS = [
  { id: 1, title: 'Porta de entrada fechada', time: 'Há 4 min', type: 'door' },
  { id: 2, title: 'Movimento na sala de estar', time: 'Há 12 min', type: 'motion' },
  { id: 3, title: 'Verificação dos dispositivos concluída', time: 'Há 1 h', type: 'system' },
];

const SENSOR_TEMPLATES = {
  3: { icon: 'motion', status: 'Sem movimento', detail: 'Monitoramento ativo', names: ['Sala de estar', 'Garagem', 'Corredor'] },
  4: { icon: 'door', status: 'Fechada', detail: 'Atualizado agora', names: ['Porta de entrada', 'Janela da cozinha', 'Porta dos fundos'] },
  7: { icon: 'smoke', status: 'Ar normal', detail: 'Nenhum risco identificado', names: ['Cozinha', 'Área de serviço'] },
};

export function buildDashboardData(selectedDevices) {
  if (!selectedDevices?.length) {
    return {
      cameras: DEFAULT_CAMERAS,
      sensors: DEFAULT_SENSORS,
      otherDevices: DEFAULT_OTHER_DEVICES,
    };
  }

  const cameras = [];
  const sensors = [];
  const otherDevices = [];

  selectedDevices.forEach((device) => {
    const quantity = Math.min(device.quantity ?? 1, 6);

    if (device.category === 'camera') {
      for (let index = 0; index < quantity && cameras.length < 4; index += 1) {
        const template = DEFAULT_CAMERAS[cameras.length % DEFAULT_CAMERAS.length];
        cameras.push({
          ...template,
          id: `${device.id}-${index}`,
          model: device.name,
          name: index === 0 ? template.name : `${template.name} ${index + 1}`,
        });
      }
      return;
    }

    if (device.category === 'sensor') {
      const template = SENSOR_TEMPLATES[device.id] ?? SENSOR_TEMPLATES[3];
      for (let index = 0; index < quantity; index += 1) {
        sensors.push({
          id: `${device.id}-${index}`,
          name: template.names[index] ?? `Ambiente ${index + 1}`,
          model: device.name,
          icon: template.icon,
          status: template.status,
          detail: template.detail,
          battery: 96 - index * 3,
          tone: 'safe',
        });
      }
      return;
    }

    const type = device.category === 'fechadura' ? 'lock' : device.category === 'alarme' ? 'siren' : 'hub';
    otherDevices.push({
      id: `${device.id}`,
      name: device.name,
      model: 'Instalado nesta residência',
      type,
      online: true,
    });
  });

  return { cameras, sensors, otherDevices };
}
