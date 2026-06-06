import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters
from services.ai_analyzer import analyze_chart
from services.trade_executor import execute_trade
from services.chain import record_signal

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def start(update: Update, context):
    await update.message.reply_text(
        "🤖 SignalAI Bot\n\n"
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

async def handle_full_flow(image_bytes: bytes):
    # 1. Claude Haiku analiza el chart
    result = await analyze_chart(image_bytes)

    # 2. 0x Swap API ejecuta el trade
    swap_tx = await execute_trade("ETH", result["signal"])

    # 3. Registrar en Monad testnet
    monad_tx = record_signal(
        token=result["token"],      # "ETH"
        action=result["signal"],    # "BUY"
        confidence_float=result["confidence"],  # 0.87
        swap_tx_hash=swap_tx,
    )

    return {**result, "tx_hash": monad_tx}

if __name__ == "__main__":
    app.run_polling()