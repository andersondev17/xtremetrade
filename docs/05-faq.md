# SignalAI — FAQ
 
Respuestas directas a las preguntas más probables durante la hackathon.
 
---
 
## Setup y entorno
 
### ¿Si creo secrets en GitHub, necesito el .env local?
 
Sí, son cosas distintas:
 
| Dónde | Para qué |
|-------|---------|
| `.env` local | Que `uvicorn` y `bot.py` corran en tu Windows |
| GitHub Secrets | Que GitHub Actions (CI) corra en la nube |
 
GitHub Secrets solo existen dentro del runner de Actions. Tu máquina no los ve.
 
### ¿Cómo verificar que una variable de entorno está cargada en Windows?
 
```powershell
echo %ANTHROPIC_API_KEY%
echo %TELEGRAM_BOT_TOKEN%
```
 
Si devuelve vacío, el `.env` no está siendo leído. Verificar que `python-dotenv` está instalado y que el código tiene `load_dotenv()` al inicio.
 
### ¿Activan venv manualmente en Windows?
 
Con `uv run` no es necesario. Si por algún motivo necesitan activarlo:
 
```powershell
.venv\Scripts\activate
```
 
En Mac/Linux sería `source .venv/bin/activate`. En Windows es distinto.
 
---
 
## Telegram y BotFather
 
### ¿Qué es BotFather?
 
Es el bot oficial de Telegram para crear y administrar bots. Es literalmente un chat dentro de Telegram.
 
### Paso a paso para crear el bot
 
1. Abrir Telegram (app o https://web.telegram.org)
2. Buscar `@BotFather` en el buscador
3. Clic en el resultado con el checkmark azul verificado
4. Escribir `/start` → luego `/newbot`
5. Nombre visible del bot: `SignalAI`
6. Username (debe terminar en `bot`): `signalai_monad_bot`
   - Si está ocupado probar: `signalai_medellin_bot`, `signalai2025bot`
7. BotFather devuelve el token: `7412583920:AAHxyz123abc...`
8. Pegar ese token en `.env` como `TELEGRAM_BOT_TOKEN=`
### ¿Cómo probar el bot?
 
1. Buscar el username del bot en Telegram: `@signalai_monad_bot`
2. Escribir `/start`
3. Si responde con el mensaje de bienvenida → funciona
4. Enviar una foto de chart → debe responder con signal
---
 
## Claude Haiku y la API de Anthropic
 
### ¿Por qué `"type": "image"` y no `"image_url"`?
 
`"image_url"` es sintaxis de OpenAI. La API de Anthropic usa:
 
```python
{
    "type": "image",
    "source": {
        "type": "base64",
        "media_type": "image/png",
        "data": "<base64_string>",
    }
}
```
 
Usar `"image_url"` devuelve un error de validación 400.
 
### ¿Qué pasa si Claude no responde en el formato exacto?
 
El parser en `ai_analyzer.py` usa `dict.get()` con defaults para todo:
 
```python
lines.get("SIGNAL", "HOLD")       # default: HOLD
lines.get("CONFIDENCE", "70%")    # default: 70%
lines.get("PATTERN", "unknown")   # default: unknown
```
 
Nunca va a crashear. En el peor caso devuelve HOLD con 70% de confidence.
 
### ¿Qué modelo usar exactamente?
 
```python
model="claude-3-haiku-20240307"
```
 
Haiku es el modelo más rápido de la familia Claude 3. Para análisis de imagen en una demo en vivo (donde el usuario ve la respuesta), la velocidad importa más que la profundidad del análisis.
 
---
 
## Blockchain y Monad
 
### ¿Qué es Monad testnet?
 
Una blockchain EVM-compatible de alta velocidad. Para el hackathon usamos el testnet — los tokens no tienen valor real y el deploy es gratuito. Es compatible con herramientas Ethereum estándar (Hardhat, web3.py, MetaMask).
 
### ¿Por qué Hardhat si el backend es Python?
 
Hardhat es la herramienta estándar para compilar y deployar contratos Solidity. Es JavaScript/Node, pero vive en una carpeta separada (`signalai-contracts/`) — no interfiere con el backend Python. El backend Python usa solo el ABI resultante y la CONTRACT_ADDRESS.
 
### ¿Qué es `uint256` con basis points?
 
Solidity no tiene tipos `float`. Para representar 87.5%, se multiplica por 10000:
 
```python
# Python → Solidity
0.87 * 10000 = 8700   # lo que se envía al contrato
 
# Solidity → leer (si necesitan mostrarlo)
8700 / 10000 = 0.87
```
 
### ¿Qué hago si el deploy falla?
 
```powershell
# Verificar que compila:
npx hardhat compile
 
# Verificar conexión a Monad:
npx hardhat run --network monadTestnet -e "console.log((await ethers.provider.getBlockNumber()))"
 
# Errores comunes:
# - "insufficient funds" → pedir más tokens del faucet
# - "network error" → el RPC de Monad puede tener downtime, esperar 2 min y reintentar
# - "private key error" → verificar que WALLET_PRIVATE_KEY empieza con 0x
```
 
### ¿Dónde ver las transacciones?
 
https://testnet.monadexplorer.com/tx/{tx_hash}
 
En la demo: tener esta URL abierta con una transacción real. Es el momento de máximo impacto visual.
 
---
 
## Tracking y colaboración
 
### ¿Cómo trackean el avance sin Jira/Trello?
 
`TODO.md` en la raíz del repo con checkboxes. Actualizar cada hora. Ver el archivo `01-backend.md` para la plantilla completa.
 
### ¿GitHub Projects o Claude Projects?
 
Son cosas distintas:
 
| Herramienta | Para qué |
|------------|---------|
| `TODO.md` | Tracking de tareas durante la hackathon — cero setup |
| GitHub Projects | Kanban visual dentro del repo — 5 min de setup si quieren board |
| Claude Projects | Contexto compartido para Claude (instrucciones, archivos) — NO es tracking de tareas |
 
Para 6 horas: `TODO.md` + Claude Projects para IA. GitHub Projects solo si tienen tiempo esta noche.
 
### ¿Cómo agregar los markdowns al Claude Project?
 
1. En claude.ai, abrir el proyecto SignalAI
2. Clic en el ícono de archivos (panel izquierdo)
3. Subir cada `.md` como archivo del proyecto
4. Claude los leerá automáticamente en cada conversación del proyecto
### ¿Dos personas pueden usar el mismo Claude Project?
 
Sí. Claude Projects se puede compartir. Ambos ven el mismo contexto, los mismos archivos subidos y el mismo historial de conversaciones del proyecto.
 
---
 
## Tokens y costos
 
### ¿Cómo evitar gastar tokens innecesariamente?
 
- Las project instructions se cargan en cada conversación — mantenerlas cortas y precisas
- En conversaciones largas, usar `/clear` o iniciar nuevo chat cuando el tema cambie
- Pasar código como texto plano, no como imagen ni PDF
- No subir `package-lock.json`, `uv.lock`, ni archivos de configuración pesados al chat
### ¿Vale la pena hablar en inglés para ahorrar tokens?
 
La diferencia es ~10-15%. No vale el costo cognitivo si piensas en español.
 
### ¿Los markdowns consumen menos tokens que PDF/Word?
 
Sí. Markdown es texto plano. PDF y Word tienen metadatos, encoding binario y estructura invisible que se traduce en tokens extra sin información útil.
 
---
 
## Demo y pitch
 
### ¿Qué hacer si algo falla en vivo?
 
Tener el video backup grabado esta noche (2 minutos del flujo completo). Si el live falla, pasar al video sin pestañear. Los jueces valoran que el equipo no entre en pánico.
 
### ¿Cuál es el orden de impresión para el jurado?
 
1. Demo visual funcionando en vivo
2. Pitch claro con hook memorable
3. Profundidad técnica
No al revés. El código más elegante del mundo no gana si la demo es confusa.
 
### ¿Cuál es el hook?
 
> "SignalAI convierte cualquier gráfico de TradingView en un trade ejecutado on-chain en 3 segundos."
 
Memorizarlo. Usarlo al inicio y al final del pitch.
 
### ¿Qué diferencia a SignalAI de KiSignal (ganador anterior)?
 
KiSignal analiza texto. SignalAI analiza **imágenes de charts** con visión multimodal. Ningún competidor en la sala hace análisis de imagen — ese es el diferenciador técnico real que los jueces reconocerán.