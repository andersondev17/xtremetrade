# SignalAI Backend — contexto para Claude Code

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