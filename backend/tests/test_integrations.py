"""
Tests de integracion — verifican conexiones reales con las API keys del .env.
Cada test se salta automaticamente si la key correspondiente no esta configurada.

Uso:
    uv run pytest tests/test_integrations.py -v -s
"""
import asyncio
import os
import sys
import pytest
import httpx

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()


# ---------------------------------------------------------------------------
# Monad RPC
# ---------------------------------------------------------------------------

def test_monad_rpc_connection():
    rpc = os.getenv("MONAD_RPC")
    if not rpc:
        pytest.skip("MONAD_RPC no esta en .env")

    from web3 import Web3
    w3 = Web3(Web3.HTTPProvider(rpc))
    assert w3.is_connected(), f"No se pudo conectar a {rpc}"
    block = w3.eth.block_number
    assert block >= 0
    print(f"\n  [OK] Monad RPC conectado - bloque actual: {block}")


def test_contract_readable():
    rpc = os.getenv("MONAD_RPC")
    contract_address = os.getenv("CONTRACT_ADDRESS")
    if not rpc or not contract_address:
        pytest.skip("MONAD_RPC o CONTRACT_ADDRESS no estan en .env")

    from web3 import Web3
    w3 = Web3(Web3.HTTPProvider(rpc))
    abi = [{
        "inputs": [],
        "name": "getSignalsCount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    }]
    contract = w3.eth.contract(address=contract_address, abi=abi)
    count = contract.functions.getSignalsCount().call()
    assert count >= 0
    print(f"\n  [OK] Contrato SignalVerifier en {contract_address} - signals registrados: {count}")


def test_wallet_has_balance():
    rpc = os.getenv("MONAD_RPC")
    private_key = os.getenv("WALLET_PRIVATE_KEY")
    if not rpc or not private_key:
        pytest.skip("MONAD_RPC o WALLET_PRIVATE_KEY no estan en .env")

    from web3 import Web3
    w3 = Web3(Web3.HTTPProvider(rpc))
    account = w3.eth.account.from_key(private_key)
    balance_wei = w3.eth.get_balance(account.address)
    balance_mon = w3.from_wei(balance_wei, "ether")
    print(f"\n  [OK] Wallet {account.address} - balance: {balance_mon:.4f} MON")


# ---------------------------------------------------------------------------
# Anthropic (Claude Haiku)
# ---------------------------------------------------------------------------

def test_anthropic_key_valid():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        pytest.skip("ANTHROPIC_API_KEY no esta en .env")

    import anthropic

    async def _call():
        client = anthropic.AsyncAnthropic(api_key=api_key)
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=5,
            messages=[{"role": "user", "content": "Responde solo: OK"}],
        )
        return msg.content[0].text.strip()

    text = asyncio.run(_call())
    assert len(text) > 0
    print(f"\n  [OK] Anthropic API valida - respuesta: {text}")


# ---------------------------------------------------------------------------
# Telegram Bot
# ---------------------------------------------------------------------------

def test_telegram_bot_token_valid():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        pytest.skip("TELEGRAM_BOT_TOKEN no esta en .env")

    r = httpx.get(f"https://api.telegram.org/bot{token}/getMe", timeout=10.0)
    assert r.status_code == 200, f"Telegram rechazo el token: {r.text}"
    data = r.json()
    assert data["ok"] is True
    bot = data["result"]
    print(f"\n  [OK] Bot valido: @{bot['username']} (id: {bot['id']})")


def test_telegram_bot_webhook_info():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        pytest.skip("TELEGRAM_BOT_TOKEN no esta en .env")

    r = httpx.get(f"https://api.telegram.org/bot{token}/getWebhookInfo", timeout=10.0)
    assert r.status_code == 200
    info = r.json()["result"]
    webhook_url = info.get("url", "")
    pending = info.get("pending_update_count", 0)
    mode = webhook_url or "sin webhook (modo polling)"
    print(f"\n  [OK] Webhook: '{mode}' - updates pendientes: {pending}")
