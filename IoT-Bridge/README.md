# NexGuard IoT Bridge (opcional)

Este serviço encaminha linhas recebidas pela porta serial do Arduino para a interface React via Socket.IO na porta TCP 3001. Ele é separado do backend biométrico FastAPI.

## Windows / PowerShell

1. Conecte o Arduino e confirme a porta COM no Gerenciador de Dispositivos.
2. Execute:

```powershell
cd IoT-Bridge
npm install
$env:SERIAL_PORT="COM3"
$env:BAUD_RATE="9600"
npm start
```

Troque `COM3` pela porta real do Arduino. O firmware deve transmitir linhas de texto terminadas em CRLF, contendo campos como `Temp: 23.5`, `Hum: 50`, `Dist: 25` e `Gas: 100`.

A interface não recebe telemetria se este serviço não estiver ativo. A Central de monitoramento continua sendo demonstrativa até que sensores e câmeras reais sejam integrados. Não conecte atuadores de fechadura a este gateway: a abertura física deve passar pelo fluxo de autorização seguro do backend biométrico.
