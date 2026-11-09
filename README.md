# NexGuard — Controle de acesso residencial

Esta versão consolida a interface React do projeto NexGuard com um backend FastAPI para cadastro de moradores autorizados, reconhecimento facial, validação de PIN pessoal e integração opcional com uma fechadura por relé.

## O que mudou

- A função principal agora é **controle de acesso na porta**.
- Um rosto só é considerado autorizado se corresponder a uma pessoa ativa e autorizada no banco.
- A abertura física exige PIN pessoal e confirmação de presença ao vivo por um dispositivo confiável.
- Imagens são decodificadas e processadas somente em memória. Nenhuma foto, vídeo, quadro, miniatura ou caminho de imagem é gravado no banco ou no disco pela aplicação.
- Apenas o embedding facial necessário à comparação é persistido, criptografado com Fernet. Embeddings são dados biométricos sensíveis, não são fotografias.
- O histórico registra decisão, motivo, horário e pessoa somente quando o acesso foi reconhecido; não armazena a imagem de visitantes desconhecidos.
- Cadastros, bloqueios, exclusões e consulta de histórico exigem sessão administrativa.
- A fechadura física vem **desativada por padrão**. Erro de câmera, imagem ruim, falha no reconhecimento, PIN inválido ou falha de comunicação nunca geram abertura.

## Estrutura

```text
NexGuard/
├── Backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── face_engine.py
│   │   ├── security.py
│   │   └── door.py
│   ├── models/       # modelos ONNX baixados pelo script
│   ├── data/         # banco SQLite gerado localmente
│   ├── scripts/
│   └── requirements.txt
├── Frontend/
│   └── src/          # site + painel de controle de acesso
├── .env.example
└── README.md
```

## 1. Requisitos

- Python 3.11 ou superior (recomendado).
- Node.js 20.19+ ou 22.12+ para a versão atual do Vite incluída no frontend.
- Uma webcam.
- Para abertura física: controlador de fechadura/relé devidamente isolado, fonte e fechadura compatíveis. Não conecte uma fechadura diretamente aos pinos de um computador.

## 2. Backend (Windows / PowerShell)

Na pasta `NexGuard`:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r Backend\requirements.txt
```

Gere segredos:

```powershell
python Backend\scripts\generate_secrets.py
```

Copie os quatro valores gerados para um arquivo `.env` na raiz do projeto. **Não compartilhe esse arquivo e não o envie ao Git.** Copie também as configurações de `.env.example` que desejar utilizar.

Baixe os modelos faciais ONNX:

```powershell
python Backend\scripts\download_models.py
```

Inicie a API:

```powershell
uvicorn app.main:app --app-dir Backend --host 127.0.0.1 --port 8000 --reload
```

Documentação interativa da API: `http://127.0.0.1:8000/docs`.

## 3. Frontend

Em outro terminal, entre em `Frontend`:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`). O navegador solicitará permissão para usar a webcam. O painel administrativo fica na seção **Controle de acesso**.

## 4. Cadastro e operação

1. Entre no painel com `ADMIN_API_KEY`, do arquivo `.env` do backend.
2. Ligue a câmera.
3. Informe nome, e-mail opcional e crie um PIN pessoal de 4 a 8 dígitos.
4. Obtenha o consentimento informado da pessoa e marque a confirmação.
5. Capture e cadastre o rosto. A fotografia é enviada em memória, convertida em embedding, e descartada; somente o embedding criptografado é salvo.
6. Para testar, ligue novamente a câmera, informe o PIN pessoal e selecione **Verificar e autorizar**.
7. Pessoas podem ter seu acesso bloqueado ou ser removidas no painel. A remoção apaga também o embedding associado.

## 5. Integração com a fechadura

Por segurança, o padrão é:

```env
PHYSICAL_UNLOCK_ENABLED=false
DOOR_RELAY_MODE=disabled
```

Nesse modo, o sistema testa a decisão de acesso, mas **não abre nenhuma fechadura real**.

A API tem dois modos opcionais de integração, que exigem configuração explícita:

- `DOOR_RELAY_MODE=http`: envia um POST autenticado para `DOOR_RELAY_URL/unlock`, com `pulse_ms` e `X-Device-Token`. O controlador (por exemplo, ESP32) precisa implementar esse endpoint e responder `{"unlocked": true}` somente depois de acionar corretamente o relé.
- `DOOR_RELAY_MODE=gpio`: usa `gpiozero` em um Raspberry Pi. Instale `gpiozero` e configure corretamente o número do pino, nível lógico e circuito de acionamento.

Somente depois de testar o circuito com uma carga de teste, configure `PHYSICAL_UNLOCK_ENABLED=true`. Mesmo assim, o backend **não aciona o relé a partir do painel web**: a abertura física exige uma chamada autenticada pelo dispositivo (`X-Device-Key`) e uma confirmação do módulo confiável de presença (`X-Liveness-Token`), além de **rosto autorizado + PIN pessoal correto**. Configure `LIVENESS_DEVICE_KEY` no backend e no dispositivo de borda. O módulo de borda só deve enviar esse cabeçalho depois de executar seu próprio mecanismo anti-spoofing/liveness. A API não fornece endpoint público de abertura manual.

**Importante:** o protótipo não implementa liveness por conta própria e não deve abrir uma porta real sem um módulo de presença confiável integrado e validado. A confirmação facial isolada não prova que a pessoa está fisicamente presente (foto/vídeo podem ser usados em ataques de apresentação). Use uma fechadura com destravamento mecânico por dentro e preserve a saída de emergência, conforme as normas aplicáveis.

## 6. Privacidade e segurança

- A aplicação não grava imagens. Evite habilitar gravação/armazenamento no firmware da câmera e no proxy reverso.
- O embedding é biométrico e permanece sensível; proteja `.env`, disco do banco SQLite e backups. Perder `FERNET_KEY` impede a leitura dos embeddings existentes.
- Não faça backup de fotos temporárias do navegador nem registre corpos de requisição em logs.
- Os eventos de acesso com mais de 30 dias são removidos na inicialização da API. Ajuste a política conforme a necessidade e a base legal.
- Mantenha a API atrás de HTTPS fora do computador local. Não exponha o serviço de desenvolvimento nem a documentação `/docs` diretamente à internet.
- No Brasil, valide a base legal, transparência, necessidade, retenção, direitos dos titulares e medidas de segurança com orientação adequada à LGPD antes de uso real. Marcar uma caixa na interface não substitui essa análise.

## 7. Limitações conhecidas do protótipo

- O reconhecimento usa OpenCV YuNet + SFace e requer os dois modelos ONNX baixados pelo script.
- O limiar `MATCH_THRESHOLD=0.45` é um ponto inicial, não uma garantia. Deve ser calibrado com testes do ambiente, câmera e população de uso, medindo falsos aceites e falsas rejeições.
- A detecção de rosto e o PIN reduzem riscos, mas não substituem liveness robusto, controles físicos, avaliação de segurança e testes de falha.
- O script de download obtém modelos do repositório OpenCV Zoo. Confirme licença e condições de uso dos modelos na implantação.
- O arquivo SQLite criado por esta versão é novo (`Backend/data/nexguard.db`). O banco antigo do ZIP original não é migrado automaticamente.
