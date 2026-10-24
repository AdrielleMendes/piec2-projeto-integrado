const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

setInterval(() => {
  const dadosSimulados = {
    temperatura: (22 + Math.random() * 8).toFixed(1),
    humidade: (40 + Math.random() * 20).toFixed(1),
    fumaca: Math.floor(Math.random() * 400),
    presenca: Math.random() > 0.3
  };
  
  io.emit('sensorData', dadosSimulados);
  console.log(`[MOCK] Enviado: Temp ${dadosSimulados.temperatura}°C | Umidade ${dadosSimulados.humidade}% | Fumaça ${dadosSimulados.fumaca}ppm`);
}, 2000);

io.on('connection', (socket) => {
  console.log('Novo cliente frontend conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket a correr na porta ${PORT}`);
});