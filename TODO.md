# SignalAI — TODO

## H1 (11:30 - 12:30)
### Backend
- [x] FastAPI corriendo en localhost:8000
- [x] /docs accesible
- [x] Bot responde a /start en Telegram
- [x] .env con todas las keys

### Frontend
- [x] shadcn-admin corriendo en localhost:3000
- [x] Dashboard con mockSignals visible
- [x] ChartUploader renderiza (sin conectar)

## H2 (12:30 - 13:30)
### Backend
- [x] ai_analyzer.py → Claude Haiku responde con signal real
- [x] /api/analyze-chart funciona con imagen real
- [x] bot.py maneja fotos correctamente

### Frontend
- [x] ChartUploader conectado a /api/analyze-chart
- [x] Signal/confidence visible en UI

## H3 (13:30 - 14:30)
### Backend
- [x] trade_executor.py → 0x quote funciona
- [x] chain.py → web3.py conectado a Monad testnet
- [x] tx_hash real en respuesta del bot

### Frontend
- [x] SignalTable con links a MonadVision
- [x] /api/signals conectado

## H4 (14:30 - 15:30)
### Backend
- [x] SignalVerifier.sol deployado en Monad testnet
- [x] CONTRACT_ADDRESS en .env
- [ ] recordSignal() funcionando via POST /api/trade (gap: solo via script manual por ahora)

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