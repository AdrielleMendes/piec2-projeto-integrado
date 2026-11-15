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
    id: 'sensor-movimento',
    name: 'Presença no ambiente',
    model: 'Sensor de Movimento NX-Motion',
    icon: 'motion',
    telemetryKey: 'presence',
    status: 'Aguardando leitura',
    detail: 'Telemetria ao vivo',
    battery: null,
    tone: 'neutral',
  },
  {
    id: 'sensor-fumaca',
    name: 'Gás e fumaça',
    model: 'Detector de Fumaça e Gás',
    icon: 'smoke',
    telemetryKey: 'smoke',
    status: 'Aguardando leitura',
    detail: 'Telemetria ao vivo',
    battery: null,
    tone: 'neutral',
  },
  {
    id: 'sensor-temperatura',
    name: 'Temperatura do ambiente',
    model: 'Sensor de Temperatura NX-Temp',
    icon: 'temperature',
    telemetryKey: 'temperature',
    status: 'Aguardando leitura',
    detail: 'Telemetria ao vivo',
    battery: null,
    tone: 'neutral',
  },
  {
    id: 'sensor-umidade',
    name: 'Umidade do ambiente',
    model: 'Sensor de Umidade NX-Humidity',
    icon: 'humidity',
    telemetryKey: 'humidity',
    status: 'Aguardando leitura',
    detail: 'Telemetria ao vivo',
    battery: null,
    tone: 'neutral',
  },
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
    id: 'sensor-janela',
    name: 'Janela da cozinha',
    model: 'Sensor de abertura',
    icon: 'door',
    status: 'Fechada',
    detail: 'Atualizado agora',
    battery: 91,
    tone: 'safe',
  },
];

export const DEFAULT_OTHER_DEVICES = [
  { id: 'lock', name: 'Porta principal', model: 'Fechadura Inteligente NX-Lock', type: 'lock', online: true },
  { id: 'hub', name: 'Central da residência', model: 'Central de Alarme NX-Hub', type: 'hub', online: true },
];

export const INITIAL_EVENTS = [
  { id: 1, title: 'Central de controle iniciada', time: 'Agora', type: 'system' },
];

const SENSOR_TEMPLATES = {
  3: { icon: 'motion', telemetryKey: 'presence', status: 'Aguardando leitura', detail: 'Telemetria ao vivo', tone: 'neutral', names: ['Presença no ambiente'] },
  4: { icon: 'door', status: 'Fechada', detail: 'Atualizado agora', tone: 'safe', names: ['Porta de entrada', 'Janela da cozinha', 'Porta dos fundos'] },
  7: { icon: 'smoke', telemetryKey: 'smoke', status: 'Aguardando leitura', detail: 'Telemetria ao vivo', tone: 'neutral', names: ['Gás e fumaça'] },
  8: { icon: 'temperature', telemetryKey: 'temperature', status: 'Aguardando leitura', detail: 'Telemetria ao vivo', tone: 'neutral', names: ['Temperatura do ambiente'] },
  9: { icon: 'humidity', telemetryKey: 'humidity', status: 'Aguardando leitura', detail: 'Telemetria ao vivo', tone: 'neutral', names: ['Umidade do ambiente'] },
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
          name: template.names[index] ?? `${template.names[0]} ${index + 1}`,
          model: device.name,
          icon: template.icon,
          telemetryKey: index === 0 ? template.telemetryKey : undefined,
          status: template.status,
          detail: template.detail,
          battery: template.telemetryKey ? null : 96 - index * 3,
          tone: template.tone ?? 'safe',
        });
      }
      return;
    }

    const type = device.category === 'fechadura' ? 'lock' : 'hub';
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
