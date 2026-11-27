const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');

const telemetryPort = Number(process.env.TELEMETRY_PORT || 3001);
const corsOrigin = process.env.CORS_ORIGIN || '*';
const debugSerial = process.env.DEBUG_SERIAL === 'true';
const presenceDistanceCm = Number(process.env.PRESENCE_DISTANCE_CM || 150);

const app = express();
app.use(cors({ origin: corsOrigin }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
});

let serialPort = null;
let serialConnected = false;
let lastUpdate = null;
const reading = {
  temperatura: null,
  humidade: null,
  distancia: null,
  fumaca: null,
  presenca: false,
  alerta: false,
  raw: null,
};

function numberFromMatch(match) {
  return match ? Number.parseFloat(match[1].replace(',', '.')) : null;
}

function processLine(line) {
  const raw = line.trim();
  if (!raw) return;
  if (debugSerial) console.log('Recebido do Arduino:', raw);

  const temperature = numberFromMatch(raw.match(/(?:Temp|Temperatura)[:\s]*([\d.,-]+)/i));
  const humidity = numberFromMatch(raw.match(/(?:Hum|Umidade|Humidade)[:\s]*([\d.,-]+)/i));
  const distance = numberFromMatch(raw.match(/(?:Dist|Distancia|Distância)[:\s]*([\d.,-]+)/i));
  const smoke = numberFromMatch(raw.match(/(?:Fumaça|Gas|Gás)[:\s]*([\d.,-]+)/i));

  if (Number.isFinite(temperature)) reading.temperatura = temperature;
  if (Number.isFinite(humidity)) reading.humidade = humidity;
  if (Number.isFinite(distance)) reading.distancia = distance;
  if (Number.isFinite(smoke)) reading.fumaca = Math.round(smoke);

  const normalized = raw.toLocaleLowerCase('pt-BR');
  reading.presenca = (
    (reading.distancia > 0 && reading.distancia < presenceDistanceCm)
    || normalized.includes('intrusao')
    || normalized.includes('intrusão')
    || normalized.includes('alerta')
  );
  reading.alerta = reading.presenca || normalized.includes('perigo') || normalized.includes('alerta');
  reading.raw = raw;
  lastUpdate = new Date().toISOString();

  io.emit('dados-sensor', { ...reading });
}

if (process.env.SERIAL_PORT) {
  serialPort = new SerialPort({
    path: process.env.SERIAL_PORT,
    baudRate: Number(process.env.BAUD_RATE || 9600),
    autoOpen: false,
  });
  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
  parser.on('data', processLine);

  serialPort.on('open', () => {
    serialConnected = true;
    console.log(`Porta serial ${process.env.SERIAL_PORT} aberta com sucesso.`);
  });
  serialPort.on('close', () => { serialConnected = false; });
  serialPort.on('error', (error) => {
    serialConnected = false;
    console.error('Erro na porta serial:', error.message);
  });
  serialPort.open((error) => {
    if (error) console.error('Não foi possível abrir a porta serial:', error.message);
  });
} else {
  console.log('SERIAL_PORT não definida; ponte WebSocket iniciada sem conexão com Arduino.');
}

app.get('/health', (_request, response) => {
  response.json({
    status: 'online',
    serialConfigured: Boolean(process.env.SERIAL_PORT),
    serialConnected,
    lastUpdate,
  });
});

io.on('connection', (socket) => {
  if (debugSerial) console.log('Novo cliente web conectado.');
  if (lastUpdate) socket.emit('dados-sensor', { ...reading });
});

server.listen(telemetryPort, () => {
  console.log(`Ponte de telemetria disponível na porta ${telemetryPort}.`);
});
