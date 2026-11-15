import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const EMPTY_READING = {
  temperatura: null,
  humidade: null,
  distancia: null,
  fumaca: null,
  presenca: null,
  alerta: false,
};

export default function useTelemetry() {
  const [connected, setConnected] = useState(false);
  const [reading, setReading] = useState(EMPTY_READING);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_TELEMETRY_URL ?? 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleReading = (data) => {
      setReading({
        temperatura: data.temperatura ?? null,
        humidade: data.humidade ?? null,
        distancia: data.distancia ?? null,
        fumaca: data.fumaca ?? null,
        presenca: data.presenca ?? null,
        alerta: Boolean(data.alerta),
      });
      setLastUpdate(new Date());
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('dados-sensor', handleReading);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('dados-sensor', handleReading);
      socket.disconnect();
    };
  }, []);

  return { connected, reading, lastUpdate };
}
