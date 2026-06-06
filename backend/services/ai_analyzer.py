import anthropic
import base64

client = anthropic.AsyncAnthropic()

async def analyze_chart(image_bytes: bytes) -> dict:
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    message = await client.messages.create(
        model="claude-haiku-4-5-20251001",
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
                        "Eres analista técnico experto en crypto trading corriendo en la red Monad (EVM L1 de alta velocidad).\n"
                        "Analiza este gráfico y responde EXACTAMENTE en este formato, sin texto adicional:\n"
                        "TOKEN: <símbolo del token visible, si no hay usa MONAD o ETH>\n"
                        "SIGNAL: BUY | SELL | HOLD\n"
                        "CONFIDENCE: <0-100>%\n"
                        "PATTERN: <nombre del patrón>\n"
                        "PRICE: <precio actual estimado>\n"
                        "TARGET: <take-profit estimado>\n"
                        "STOPLOSS: <stop-loss estimado>\n"
                        "TIMEFRAME: <15M, 1H, 4H o 1D>\n"
                        "INDICATORS: <indicadores separados por coma>\n"
                        "REASON: <resumen de 2 oraciones>"
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
    indicators_raw = lines.get("INDICATORS", "")
    indicators = [i.strip() for i in indicators_raw.split(",") if i.strip()]

    return {
        "token": lines.get("TOKEN", "MONAD"),
        "signal": lines.get("SIGNAL", "HOLD"),
        "confidence": confidence,
        "pattern": lines.get("PATTERN", "unknown"),
        "price": float(lines.get("PRICE", "0").replace(",", "").replace("$", "") or 0),
        "targetPrice": float(lines.get("TARGET", "0").replace(",", "").replace("$", "") or 0),
        "stopLoss": float(lines.get("STOPLOSS", "0").replace(",", "").replace("$", "") or 0),
        "timeframe": lines.get("TIMEFRAME", "1H"),
        "indicators": indicators,
        "explanation": lines.get("REASON", text),
        "analysis": lines.get("REASON", text),  # backwards compat
    }