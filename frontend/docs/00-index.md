# Xtreme Trade — Monad Blitz Medellín
 
Bot de Telegram que analiza charts de TradingView con IA multimodal, genera señales BUY/SELL y ejecuta trades on-chain en Monad testnet.
 
**Hook:** *"Xtreme Trade convierte cualquier gráfico de TradingView en un trade ejecutado on-chain en 3 segundos."*
 
**Diferenciador:** KiSignal (ganador anterior) analiza texto. Xtreme Trade analiza imágenes de charts — nadie más lo hace en la sala.
 
---
 
## Flujo crítico (prioridad absoluta)
 
```
imagen → Claude Haiku → signal → 0x trade → Monad tx_hash
```
 
## Contrato de API (fijo, no cambiar)
 
```
POST /api/analyze-chart → {signal, confidence, pattern, analysis}
POST /api/trade         → {tx_hash, token, amount, signal}
GET  /api/signals       → Signal[]
```
 
## Stack
 
| Capa | Tecnología |
|------|-----------|
| Bot | python-telegram-bot |
| Backend | Python 3.12 + uv + FastAPI |
| IA | Claude Haiku (claude-3-haiku-20240307) |
| DeFi | 0x Swap API |
| Blockchain | web3.py + Monad testnet |
| Smart contract | Solidity 0.8.20 + Hardhat |
| Frontend | Next.js 15 + shadcn/ui + Tailwind |
 
## Archivos del proyecto
 
| Archivo | Contenido |
|---------|-----------|
| `01-backend.md` | Setup uv, FastAPI, Telegram bot, ai_analyzer, trade_executor, TODO.md |
| `02-frontend.md` | Setup shadcn-admin, mocks, ChartUploader, SignalTable |
| `03-blockchain.md` | MetaMask, Monad testnet, Hardhat, SignalVerifier.sol, chain.py |
| `04-bmad.md` | Agentes claude-code-templates, roles BMAD, checkpoints, CLAUDE.md |
| `05-faq.md` | Errores comunes, BotFather, tokens, demo backup |
 
## Plan de 6 horas
 
| Hora | Backend | Frontend |
|------|---------|----------|
| H1 11:30 | FastAPI + bot /start | shadcn-admin + mocks |
| H2 12:30 | Claude Haiku + imagen → signal | ChartUploader conectado |
| H3 13:30 | 0x quote + web3.py → tx hash | SignalTable con MonadVision links |
| H4 14:30 | Deploy SignalVerifier.sol | Polish visual |
| H5 15:30 | End-to-end completo | Dark mode + responsive |
| H6 16:30 | Video backup + rehearsal | Slides pitch |
 
**Checkpoint BMAD 2:30 PM:** ¿El flujo imagen → signal → trade → tx funciona? Si no, cortar dashboard y priorizar el bot de Telegram.