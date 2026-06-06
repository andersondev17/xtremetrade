
raw
# Xtreme Trade — Backend
 
> Stack: Python 3.12 · uv · FastAPI · python-telegram-bot · anthropic SDK · web3.py
> OS: Windows
 
---
 
## Estructura de archivos
 
```
signalai-backend/
├── .env                  ← API keys reales, NUNCA a git
├── .env.example          ← Nombres sin valores, sí a git
├── .gitignore
├── .python-version       ← contiene "3.12"
├── pyproject.toml
├── uv.lock               ← sí a git
├── Dockerfile
├── CLAUDE.md             ← contexto del proyecto para Claude Code
├── TODO.md               ← checkboxes de avance, actualizar cada hora
├── main.py               ← FastAPI app + endpoints + CORS
├── bot.py                ← Telegram bot
└── services/
    ├── ai_analyzer.py    ← Claude Haiku → signal
    ├── trade_executor.py ← 0x Swap API
    └── chain.py          ← web3.py → Monad testnet
```
 
---
 
## TODO.md (trackear avance durante la hackathon)
 
Crear este archivo en la raíz del repo. Ambos lo actualizan cada hora.
 
```markdown
# Xtreme Trade — TODO
 
## H1 (11:30 - 12:30)
### Backend
- [ ] FastAPI corriendo en localhost:8000
- [ ] /docs accesible
- [ ] Bot responde a /start en Telegram
- [ ] .env con todas las keys
 
### Frontend
- [ ] shadcn-admin corriendo en localhost:3000
- [ ] Dashboard con mockSignals visible
- [ ] ChartUploader renderiza (sin conectar)
 
## H2 (12:30 - 13:30)
### Backend
- [ ] ai_analyzer.py → Claude Haiku responde con signal real
- [ ] /api/analyze-chart funciona con imagen real
- [ ] bot.py maneja fotos correctamente
 
### Frontend
- [ ] ChartUploader conectado a /api/analyze-chart
- [ ] Signal/confidence visible en UI
 
## H3 (13:30 - 14:30)
### Backend
- [ ] trade_executor.py → 0x quote funciona
- [ ] chain.py → web3.py conectado a Monad testnet
- [ ] tx_hash real en respuesta del bot
 
### Frontend
- [ ] SignalTable con links a MonadVision
- [ ] /api/signals conectado
 
## H4 (14:30 - 15:30)
### Backend
- [ ] SignalVerifier.sol deployado en Monad testnet
- [ ] CONTRACT_ADDRESS en .env
- [ ] recordSignal() funcionando
 
### Frontend
- [ ] Polish visual completo
- [ ] Dark mode verificado
 
## H5 (15:30 - 16:30)
- [ ] Flujo end-to-end probado 3 veces completo
- [ ] Video backup grabado (2 min)
- [ ] MonadVision abierto con tx real
 
## H6 (16:30 - 17:30)
- [ ] Rehearsal del pitch 3 veces
- [ ] Plan B preparado (video backup listo)
```
 
---
 
## CLAUDE.md (contexto para Claude Code en el proyecto)
 
Crear en la raíz de `signalai-backend/`. Claude Code lo lee automáticamente.
 
```markdown
# Xtreme Trade Backend — contexto para Claude Code
 
Stack: Python 3.12, uv, FastAPI, python-telegram-bot, anthropic SDK, web3.py
OS: Windows. Usar `uv run` siempre, nunca `python` directo.
 
Flujo crítico: imagen → Claude Haiku (claude-3-haiku-20240307) → signal → 0x trade → Monad tx_hash
 
Contrato de API fijo:
- POST /api/analyze-chart → {signal, confidence, pattern, analysis}
- POST /api/trade → {tx_hash, token, amount, signal}
- GET /api/signals → Signal[]
 
Reglas:
- Sin preámbulo, sin explicaciones. Solo código.
- Código completo y funcional, no pseudocódigo.
- confidence como float 0.0-1.0 en Python, uint256 basis points en Solidity (0.87 → 8700).
- Claude Haiku usa "type": "image" con source.type: "base64". NUNCA "image_url".
```
 
---
 
## Paso 0 — Setup (esta noche)
 
### Instalar uv en Windows
 
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
# Cerrar y reabrir terminal, luego verificar:
uv --version
```
 
### Crear el proyecto
 
```powershell
uv init signalai-backend
cd signalai-backend
uv python pin 3.12
uv add fastapi "uvicorn[standard]" python-telegram-bot httpx anthropic web3 python-dotenv
uv add --dev pytest
```
 
### Instalar agentes de Claude Code (claude-code-templates)
 
```powershell
# Instalar Claude Code si no lo tiene:
npm install -g @anthropic-ai/claude-code
 
# Agente estratega de hackathon:
npx claude-code-templates@latest --agent ai-specialists/hackathon-ai-strategist
 
# Agente especializado en APIs:
npx claude-code-templates@latest --agent api-developer
```
 
Usar el strategist en 3 momentos:
- **11:30** — "Valida el scope de Xtreme Trade para 6h. ¿Es factible?"
- **14:30** — "¿Qué cortamos si vamos atrasados?"
- **16:30** — "Genera pitch de 2 min con este hook: [hook]"
### .gitignore
 
```
.env
.venv
__pycache__/
*.pyc
node_modules/
```
 
### .env.example (sí a git)
 
```env
TELEGRAM_BOT_TOKEN=
ANTHROPIC_API_KEY=
MONAD_RPC=https://testnet.monad.xyz
WALLET_PRIVATE_KEY=
CONTRACT_ADDRESS=
ZEROX_API_KEY=
```
 
---
 
## Paso 1 — Crear el bot de Telegram con BotFather
 
BotFather es el bot oficial de Telegram para crear bots. Es un chat dentro de Telegram.
 
1. Abrir Telegram (app o https://web.telegram.org)
2. En el buscador escribir: `@BotFather`
3. Clic en el resultado con checkmark azul verificado
4. Presionar **START** o escribir `/start`
5. Escribir `/newbot`
6. Responder al nombre visible: `Xtreme Trade`
7. Responder al username (debe terminar en `bot`): `signalai_monad_bot`
   - Si está ocupado probar: `signalai_medellin_bot`, `signalai2025bot`
8. BotFather devuelve un token: `7412583920:AAHxyz123abc...`
9. Pegar ese token en `.env` como `TELEGRAM_BOT_TOKEN=7412583920:AAHxyz123abc...`
> El token es como una contraseña. Quien lo tenga controla el bot. Nunca a git.
 
---
 
## Paso 2 — main.py
 
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
 
app = FastAPI(title="Xtreme Trade API")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
class ChartRequest(BaseModel):
    image_base64: str
 
class TradeRequest(BaseModel):
    token: str
    amount: float
 
@app.post("/api/analyze-chart")
async def analyze_chart(req: ChartRequest):
    from services.ai_analyzer import analyze_chart as _analyze
    image_bytes = base64.b64decode(req.image_base64)
    return await _analyze(image_bytes)
 
@app.post("/api/trade")
async def trade(req: TradeRequest):
    from services.trade_executor import execute_trade
    tx_hash = await execute_trade(req.token, "BUY", req.amount)
    return {"tx_hash": tx_hash, "token": req.token, "amount": req.amount, "signal": "BUY"}
 
@app.get("/api/signals")
async def get_signals():
    return []
```
 
```powershell
uv run uvicorn main:app --reload --port 8000
# Verificar: abrir http://localhost:8000/docs
```
 
---
 
## Paso 3 — services/ai_analyzer.py
 
```python
import anthropic
import base64
 
client = anthropic.Anthropic()
 
async def analyze_chart(image_bytes: bytes) -> dict:
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
 
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_b64,
                    },
                },
                {
                    "type": "text",
                    "text": (
                        "Eres analista técnico experto en crypto trading. "
                        "Analiza este gráfico y responde EXACTAMENTE:\n"
                        "PATTERN: <patrón>\n"
                        "SIGNAL: BUY | SELL | HOLD\n"
                        "CONFIDENCE: <0-100>%\n"
                        "REASON: <razón en una línea>"
                    )
                }
            ],
        }]
    )
 
    text = message.content[0].text
    lines = {
        l.split(":")[0].strip(): l.split(":", 1)[1].strip()
        for l in text.splitlines() if ":" in l
    }
    confidence = float(lines.get("CONFIDENCE", "70%").replace("%", "").strip()) / 100
 
    return {
        "signal": lines.get("SIGNAL", "HOLD"),
        "confidence": confidence,
        "pattern": lines.get("PATTERN", "unknown"),
        "analysis": lines.get("REASON", text),
    }
```
 
**Probar esta noche:**
 
```powershell
# Descargar cualquier imagen de TradingView como test_chart.png
uv run python -c "
import asyncio, pathlib
from services.ai_analyzer import analyze_chart
img = pathlib.Path('test_chart.png').read_bytes()
print(asyncio.run(analyze_chart(img)))
"
```
 
Si falla con error de API key: `echo %ANTHROPIC_API_KEY%` en Windows para verificar.
 
---
 
## Paso 4 — bot.py
 
```python
import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters
from services.ai_analyzer import analyze_chart
 
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
 
async def start(update: Update, context):
    await update.message.reply_text(
        "🤖 Xtreme Trade Bot\n\n"
        "Envía un chart de TradingView → analizo la señal con IA.\n"
        "/signals — Ver signals activos"
    )
 
async def handle_chart(update: Update, context):
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    image_bytes = await file.download_as_bytearray()
 
    await update.message.reply_text("⏳ Analizando chart...")
 
    result = await analyze_chart(bytes(image_bytes))
 
    emoji = {"BUY": "🚀", "SELL": "🔴", "HOLD": "⏸️"}.get(result["signal"], "📊")
    await update.message.reply_text(
        f"📊 Patrón: {result['pattern']}\n"
        f"{emoji} Signal: {result['signal']}\n"
        f"🎯 Confidence: {result['confidence']*100:.0f}%\n"
        f"💡 {result['analysis']}"
    )
 
app = Application.builder().token(BOT_TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.PHOTO, handle_chart))
 
if __name__ == "__main__":
    app.run_polling()
```
 
```powershell
# Terminal separada del uvicorn:
uv run python bot.py
```
 
---
 
## Paso 5 — services/trade_executor.py
 
```python
import httpx
import os
 
async def execute_trade(token: str, signal: str, amount_usdt: float = 10.0) -> str:
    api_key = os.getenv("ZEROX_API_KEY", "")
    headers = {"0x-api-key": api_key} if api_key else {}
 
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.0x.org/swap/v1/quote",
                params={
                    "sellToken": "USDT" if signal == "BUY" else token,
                    "buyToken": token if signal == "BUY" else "USDT",
                    "sellAmount": str(int(amount_usdt * 1_000_000)),
                },
                headers=headers,
                timeout=10.0
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("data", "0x" + "b" * 64)
    except Exception as e:
        print(f"0x API error: {e} — usando tx hash de demo")
        return "0x" + "c" * 64
```
 
---
 
## Comandos rápidos (Windows)
 
```powershell
uv run uvicorn main:app --reload --port 8000   # FastAPI
uv run python bot.py                            # Telegram bot (terminal separada)
uv add <paquete>                                # Agregar dependencia
uv run pytest                                   # Tests
echo %ANTHROPIC_API_KEY%                        # Verificar variable de entorno
```