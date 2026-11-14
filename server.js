const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));

const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  autoOpen: true
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

port.on('open', () => {
  console.log('Porta COM3 aberta com sucesso.');
});

port.on('error', (err) => {
  console.error('Erro na porta serial:', err.message);
});

let ultimaTemp = 0.0;
let ultimaHum = 0.0;
let ultimaDistancia = 0;
let ultimaFumaca = 0;

parser.on('data', (line) => {
  const dataStr = line.trim();
  console.log('Recebido do Arduino:', dataStr);

  const matchTemp = dataStr.match(/(?:Temp|Temperatura)[:\s]*([\d\.-]+)/i);
  const matchHum = dataStr.match(/(?:Hum|Umidade|Humidade)[:\s]*([\d\.-]+)/i);
  const matchDist = dataStr.match(/(?:Dist|Distancia)[:\s]*([\d\.-]+)/i);
  const matchGas = dataStr.match(/(?:Fumaça|Gas|Gás)[:\s]*(\d+)/i);

  if (matchTemp) ultimaTemp = parseFloat(matchTemp[1]);
  if (matchHum) ultimaHum = parseFloat(matchHum[1]);
  if (matchDist) ultimaDistancia = parseFloat(matchDist[1]);
  if (matchGas) ultimaFumaca = parseInt(matchGas[1], 10);

  const presenca = (ultimaDistancia > 0 && ultimaDistancia < 150) || dataStr.toLowerCase().includes('intrusao') || dataStr.toLowerCase().includes('alerta');
  const alerta = dataStr.includes('ALERTA') || dataStr.includes('Perigo') || presenca;

  io.emit('dados-sensor', {
    temperatura: ultimaTemp,
    humidade: ultimaHum,
    distancia: ultimaDistancia,
    fumaca: ultimaFumaca,
    presenca: presenca,
    alerta: alerta,
    raw: dataStr
  });
});

io.on('connection', (socket) => {
  console.log('Novo cliente web ligado.');
});

server.listen(3001, () => {
  console.log('Servidor WebSocket a correr na porta 3001');
});