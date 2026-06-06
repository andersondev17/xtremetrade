# Guia de Pruebas Manuales — SignalAI / XtremeTrade

---

## 1. Setup (Pre-requisitos)

### Variables de entorno requeridas

`backend/.env`:

```dotenv
ANTHROPIC_API_KEY=sk-ant-...
MONAD_RPC=https://testnet-rpc.monad.xyz
WALLET_PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
TELEGRAM_BOT_TOKEN=123456:ABC-...
ZEROX_API_KEY=          # opcional
```

`smart-contracts/.env`:
```dotenv
WALLET_PRIVATE_KEY=0x...
```

### Levantar el stack

```powershell
# Terminal 1 — FastAPI (puerto 8000)
cd backend && uv run main.py

# Terminal 2 — Frontend (puerto 3000, proxy → 8000)
cd frontend && npm install && npm run dev

# Terminal 3 — Telegram bot (proceso separado)
cd backend && uv run bot.py

# Desplegar contrato (solo si no está desplegado)
cd smart-contracts && npx hardhat run scripts/deploy.js --network monadTestnet
```

---

## 2. Casos de Uso — Backend (localhost:8000)

### 2.1 GET /api/health
```bash
curl http://localhost:8000/api/health
```
**Esperado:** `status: "ok"` con 4 checks: `monad_rpc`, `contract`, `anthropic`, `telegram`.  
Si alguno falla → `status: "degraded"`, revisar la variable de entorno correspondiente.

---

### 2.2 GET /api/signals
```bash
curl http://localhost:8000/api/signals
```
**Esperado:** `{"status":"ok","signals":[...]}` con 7 signals precargados al arrancar.  
Tras ~25s el simulation loop puede agregar más o cambiar estados ACTIVE→COMPLETED.

---

### 2.3 POST /api/signals (crear signal manual)
```bash
curl -X POST http://localhost:8000/api/signals \
  -H "Content-Type: application/json" \
  -d '{
    "token": "DMONS", "signal": "BUY", "confidence": 0.81,
    "pattern": "Bull Flag", "price": 2.15, "targetPrice": 2.45,
    "stopLoss": 2.00, "timeframe": "15M"
  }'
```
**Esperado:** `{"status":"ok","signal":{"id":"sig_custom_...","status":"ACTIVE",...}}`

---

### 2.4 POST /api/analyze-chart
```powershell
# PowerShell
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\chart.png"))
$body = "{`"imageBase64`":`"$b64`",`"filename`":`"chart.png`"}"
Invoke-RestMethod -Uri "http://localhost:8000/api/analyze-chart" -Method POST -ContentType "application/json" -Body $body
```

**Esperado (modo `live` con ANTHROPIC_API_KEY válida):**
```json
{
  "status": "ok", "mode": "live",
  "analysis": {
    "token": "ETH", "signal": "BUY", "confidence": 0.87,
    "pattern": "Ascending Triangle", "price": 3450.0,
    "targetPrice": 3700.0, "stopLoss": 3300.0,
    "timeframe": "1H", "indicators": ["EMA50","RSI","MACD"],
    "explanation": "Patron de triangulo ascendente..."
  },
  "signal": {"id": "sig_ai_...", "status": "ACTIVE", ...}
}
```
Si `mode: "simulation"` → clave de Anthropic no configurada, resultado es sintético.

---

### 2.5 GET /api/agent/state
```bash
curl http://localhost:8000/api/agent/state
```
**Esperado:** Estado completo con `riskProfile`, `executionMode`, `currentBalance`, `opportunities[]`, `logs[]`.

---

### 2.6 POST /api/agent/configure
```bash
# Cambiar a AUTOPILOT con perfil RISKY
curl -X POST http://localhost:8000/api/agent/configure \
  -H "Content-Type: application/json" \
  -d '{"riskProfile": "RISKY", "executionMode": "AUTOPILOT"}'

# Pausar el agente
curl -X POST http://localhost:8000/api/agent/configure \
  -H "Content-Type: application/json" \
  -d '{"isOperating": false}'
```
**Valores válidos:** `riskProfile`: `CONSERVATIVE|INTERMEDIATE|RISKY` · `executionMode`: `AUTOPILOT|ASSISTED`  
Valores inválidos son ignorados silenciosamente.

---

### 2.7 POST /api/agent/opportunity/approve
```bash
# Obtener opportunityId con GET /api/agent/state primero
curl -X POST http://localhost:8000/api/agent/opportunity/approve \
  -H "Content-Type: application/json" \
  -d '{"opportunityId": "opp_1"}'
```
**Esperado:** `{"status":"ok","signal":{...},"state":{...}}`  
El balance baja según `riskProfile`: 15% (CONSERVATIVE), 30% (INTERMEDIATE), 50% (RISKY).  
**Errores:** `404` si el id no existe · `400` si el agente está pausado o sin capital suficiente.

---

### 2.8 POST /api/agent/opportunity/reject
```bash
curl -X POST http://localhost:8000/api/agent/opportunity/reject \
  -H "Content-Type: application/json" \
  -d '{"opportunityId": "opp_2"}'
```
**Esperado:** La oportunidad desaparece de `state.opportunities`. Log de tipo `DECISION` añadido.

---

### 2.9 POST /api/agent/signal/close
```bash
curl -X POST http://localhost:8000/api/agent/signal/close \
  -H "Content-Type: application/json" \
  -d '{"signalId": "sig_1"}'
```
**Esperado:** Signal pasa a `COMPLETED`, `currentBalance` se actualiza con payout (60% prob. PROFIT).  
**Errores:** `404` si no existe · `400` si ya está COMPLETED.

---

### 2.10 POST /api/agent/reset
```bash
curl -X POST http://localhost:8000/api/agent/reset
```
**Esperado:** balance=12500, riskProfile=CONSERVATIVE, executionMode=ASSISTED, 1 opportunity inicial, logs limpios.

---

### 2.11 GET /api/stats
```bash
curl http://localhost:8000/api/stats
```
**Esperado:** `winRate`, `totalSignals`, `completedSignals`, `totalPnl`, `accuracyHistory[]`, `pnlHistory[]`.

---

### 2.12 POST /api/trade
```bash
curl -X POST http://localhost:8000/api/trade \
  -H "Content-Type: application/json" \
  -d '{"token": "ETH", "amount": 10.0}'
```
**Esperado (sin ZEROX_API_KEY):** `{"tx_hash":"0xccc...","token":"ETH","amount":10.0,"signal":"BUY"}`  
> Nota: este endpoint **no** registra el signal en Monad — eso solo ocurre via `handle_full_flow` del bot.

---

## 3. Casos de Uso — Frontend (localhost:3000)

### 3.1 Cargar Dashboard y ver el feed
1. Abrir `http://localhost:3000`
2. Clic en **"Enter Dashboard"**
3. Tab **"Live Feed"** → deben aparecer los 7 signals precargados
4. Verificar que los datos coinciden con `GET /api/signals`

### 3.2 Subir imagen para análisis IA
1. En la tarjeta **"multimodal visual parser"**, arrastrar/soltar un screenshot de TradingView
2. Spinner: `"Scanning Candle Geometry..."`
3. Resultado: panel **"AI Multimodal Vision Verdict"** con token, signal, precio, TP, SL, indicadores
4. Verificar que `mode: "live"` en los logs del servidor (Claude Haiku procesó la imagen)
5. El nuevo signal aparece al inicio del Live Feed

### 3.3 Configurar el agente
1. Tab **"Autonomous Agent"** → sección **"Active Risk Profile Parameter"**
2. Clic en **Conservador / Intermedio / Arriesgado** → botón se pone fondo negro
3. Sección **"OPERATIONAL MODE"** → clic en **Supervisory** o **Autopilot**
4. Clic en el valor `$5,000 MONAD Trigger` → input editable → ingresar valor → "Save"
5. Boton **"Agent Status: LIVE"** → pausa/reanuda el agente

### 3.4 Aprobar oportunidad en modo ASSISTED
1. Con `executionMode: ASSISTED`, sección **"Scanned Liquidity Pool Opportunities Tray"**
2. Clic **"Approve & Execute Position"** en una tarjeta
3. La tarjeta desaparece con animación
4. En **"Active Managed Agent Positions"** aparece nueva posición con capital asignado
5. Balance de portafolio se reduce

### 3.5 Activar AUTOPILOT
1. Cambiar a **"Autopilot (Automated)"**
2. Las tarjetas de oportunidades muestran **"Autopilot handling execution"**
3. Esperar 25-50s → el loop genera y ejecuta oportunidades automáticamente
4. Audit log muestra `[LOGIC] Identified Opportunity` seguido inmediato de `[ORDER] Opened position`

### 3.6 Cerrar posición activa manualmente
1. En **"Active Managed Agent Positions"**, clic en **"Exit Trade early"** (botón rojo)
2. Posición desaparece
3. Balance se actualiza con el payout
4. Log registra `[EXIT] Manual Exit: TOKEN/USDC closed early. PnL: +/-X%`

### 3.7 Performance y Archived Logs
- Tab **"Performance"**: win rate, PnL histórico, accuracy distribution
- Tab **"Archived Logs"**: historial completo con PROFIT/LOSS y valor pnl

### 3.8 Reset del agente
1. Clic en el ícono de rotación (reset) en el panel del agente
2. Balance → 12,500 · riskProfile → CONSERVATIVE · logs → solo "reset completed"
3. El feed global de signals **no se borra** (solo el estado del agente)

---

## 4. Casos de Uso — Telegram Bot

### Encontrar el bot
El username está en `GET /api/health` → `checks.telegram.bot_username`.

### Flujo
1. Enviar `/start` → responde con mensaje de bienvenida
2. Enviar una **foto** (no archivo adjunto) de un chart de criptomonedas
3. Bot responde: `"Analizando chart..."`
4. Luego responde con patrón, signal (🚀 BUY / 🔴 SELL / ⏸️ HOLD), confidence y razonamiento

> **Nota importante:** `handle_full_flow` (flujo completo con registro en Monad) está definido en `bot.py` pero **no está conectado a ningún handler activo**. Los signals analizados via Telegram **no aparecen en el dashboard web** ni se registran on-chain automáticamente.

---

## 5. Casos de Uso — Smart Contract (Monad Testnet)

### Verificar el contrato
Buscar `CONTRACT_ADDRESS` en `https://testnet.monadvision.xyz/`

### Leer `getSignalsCount()` desde Python
```python
from web3 import Web3
w3 = Web3(Web3.HTTPProvider("https://testnet-rpc.monad.xyz"))
abi = [{"inputs":[],"name":"getSignalsCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
contract = w3.eth.contract(address="0xTU_CONTRACT_ADDRESS", abi=abi)
print(contract.functions.getSignalsCount().call())
```

### Hardhat console
```powershell
cd smart-contracts
npx hardhat console --network monadTestnet
```
```javascript
const sv = await ethers.getContractAt("SignalVerifier", "0xTU_CONTRACT_ADDRESS");
(await sv.getSignalsCount()).toString();
await sv.signals(0); // [id, trader, token, action, timestamp, confidence, txHash]
```

### Registrar un signal manualmente (flujo E2E completo)
```powershell
cd backend
uv run python -c "
import asyncio
from services.ai_analyzer import analyze_chart
from services.trade_executor import execute_trade
from services.chain import record_signal

async def test():
    with open('chart.png', 'rb') as f:
        img = f.read()
    result = await analyze_chart(img)
    swap_tx = await execute_trade(result['token'], result['signal'])
    monad_tx = record_signal(result['token'], result['signal'], result['confidence'], swap_tx)
    print('Monad tx_hash:', monad_tx)

asyncio.run(test())
"
```
Buscar el `monad_tx` en `https://testnet.monadvision.xyz/tx/0x...`  
Verificar que el evento `SignalRecorded` fue emitido con `confidence` en basis points (0.87 → 8700).

---

## 6. Flujo E2E Completo

**imagen → Claude Haiku → signal → 0x trade → Monad tx_hash**

```bash
# Paso 1 — Leer contador inicial
curl http://localhost:8000/api/health   # anotar checks.contract.signals_count = N

# Paso 2 — Analizar imagen (PowerShell)
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("chart.png"))
Invoke-RestMethod -Uri "http://localhost:8000/api/analyze-chart" -Method POST -ContentType "application/json" -Body "{`"imageBase64`":`"$b64`"}"
# Anotar: analysis.token, analysis.signal, analysis.confidence, signal.id

# Paso 3 — Verificar signal en el feed
curl http://localhost:8000/api/signals   # el id "sig_ai_..." debe estar primero

# Paso 4 — Ejecutar trade
curl -X POST http://localhost:8000/api/trade -H "Content-Type: application/json" -d '{"token":"ETH","amount":10}'
# Anotar tx_hash

# Paso 5 — Registrar en Monad (script Python de sección 5)

# Paso 6 — Verificar registro on-chain
curl http://localhost:8000/api/health   # signals_count debe ser N+1
# Buscar monad_tx en https://testnet.monadvision.xyz/
```

> **Gap conocido:** `POST /api/trade` en `main.py` llama solo a `execute_trade` (0x quote) pero **no llama a `record_signal`** (Monad). El registro on-chain automático vía API REST no está implementado aún.

---

## 7. Checklist para el PR

```markdown
## QA Checklist

### Backend
- [ ] GET /api/health → status "ok" con 4 checks pasando
- [ ] GET /api/signals → 7 signals precargados
- [ ] POST /api/signals → crea signal con id "sig_custom_..."
- [ ] POST /api/analyze-chart con imagen válida → mode: "live"
- [ ] POST /api/analyze-chart sin ANTHROPIC_API_KEY → mode: "simulation" sin crash
- [ ] POST /api/agent/configure → actualiza riskProfile, executionMode, minCapitalLimit, isOperating
- [ ] POST /api/agent/configure con valores inválidos → ignorado silenciosamente
- [ ] POST /api/agent/opportunity/approve → reduce balance según riskProfile
- [ ] POST /api/agent/opportunity/approve con id inexistente → 404
- [ ] POST /api/agent/opportunity/reject → elimina oportunidad del tray
- [ ] POST /api/agent/signal/close → cierra signal ACTIVE y actualiza balance
- [ ] POST /api/agent/signal/close en signal COMPLETED → 400
- [ ] POST /api/agent/reset → restaura todos los valores por defecto
- [ ] GET /api/stats → winRate, totalPnl, accuracyHistory, pnlHistory
- [ ] POST /api/trade → devuelve tx_hash sin crash
- [ ] Simulation loop → genera oportunidades cada ~25s
- [ ] Anti-loss rule → 3 pérdidas bajan riskProfile a CONSERVATIVE
- [ ] Anti-loss crítico → CONSERVATIVE + 3 pérdidas suspende agente

### Frontend
- [ ] Landing Page carga en localhost:3000
- [ ] Navegación a #dashboard funciona
- [ ] Tab "Live Feed" muestra signals del backend
- [ ] Drag-and-drop de imagen funciona
- [ ] Panel "AI Multimodal Vision Verdict" aparece tras análisis exitoso
- [ ] Tab "Autonomous Agent" muestra balance, riskProfile, executionMode, logs
- [ ] Cambiar riskProfile/executionMode vía UI llama a /api/agent/configure
- [ ] Editar minCapitalLimit vía click funciona
- [ ] Botón Approve en modo ASSISTED ejecuta la oportunidad
- [ ] Modo AUTOPILOT → oportunidades se ejecutan solas
- [ ] Sección "Active Managed Agent Positions" solo muestra signals sig_agent_*
- [ ] Botón "Exit Trade early" cierra posición y actualiza balance
- [ ] Botón reset restaura estado del agente (no borra el feed global)
- [ ] Tab "Performance" muestra gráficas calculadas sobre signals reales

### Telegram Bot
- [ ] /start responde con mensaje de bienvenida
- [ ] Enviar foto dispara handle_chart y responde con análisis
- [ ] Enviar texto no genera error

### Smart Contract
- [ ] getSignalsCount() devuelve el número correcto de signals
- [ ] recordSignal() con confidence > 10000 es rechazada por el contrato
- [ ] Evento SignalRecorded visible en testnet.monadvision.xyz
- [ ] tx_hash de Monad aparece en el explorador

### Flujo E2E
- [ ] imagen → Claude Haiku → signal → 0x trade → record_signal completa sin errores
- [ ] getSignalsCount() incrementa tras trade E2E completo
- [ ] confidence se convierte correctamente a basis points (0.87 → 8700)
```
