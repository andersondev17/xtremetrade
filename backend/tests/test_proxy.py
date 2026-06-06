"""
Prueba de integración: verifica que el proxy Express (port 3000) reenvía correctamente a FastAPI (port 8000).
Requiere ambos servidores corriendo antes de ejecutar.

Uso:
    uv run pytest tests/test_proxy.py -v
"""
import pytest
import httpx


FASTAPI_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"


def _server_up(url: str) -> bool:
    try:
        httpx.get(url, timeout=2.0)
        return True
    except Exception:
        return False


@pytest.fixture(scope="module", autouse=True)
def require_servers():
    if not _server_up(FASTAPI_URL):
        pytest.skip(f"FastAPI no está corriendo en {FASTAPI_URL} — ejecuta: cd backend && uv run main.py")
    if not _server_up(FRONTEND_URL):
        pytest.skip(f"Frontend no está corriendo en {FRONTEND_URL} — ejecuta: cd frontend && npm run dev")


def test_fastapi_direct_signals():
    r = httpx.get(f"{FASTAPI_URL}/api/signals")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_proxy_signals():
    r = httpx.get(f"{FRONTEND_URL}/api/signals")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert isinstance(data["signals"], list)


def test_proxy_agent_state():
    r = httpx.get(f"{FRONTEND_URL}/api/agent/state")
    assert r.status_code == 200
    state = r.json()["state"]
    assert "riskProfile" in state
    assert "executionMode" in state


def test_proxy_stats():
    r = httpx.get(f"{FRONTEND_URL}/api/stats")
    assert r.status_code == 200
    assert "winRate" in r.json()["stats"]


def test_proxy_create_signal():
    r = httpx.post(f"{FRONTEND_URL}/api/signals", json={
        "token": "PROXY_TEST", "signal": "BUY", "confidence": 0.85,
        "pattern": "Proxy Test Pattern", "price": 2.5, "targetPrice": 2.8,
        "stopLoss": 2.3, "timeframe": "1H",
    })
    assert r.status_code == 200
    assert r.json()["signal"]["token"] == "PROXY_TEST"


def test_proxy_configure_agent():
    r = httpx.post(f"{FRONTEND_URL}/api/agent/configure", json={"executionMode": "AUTOPILOT"})
    assert r.status_code == 200
    assert r.json()["state"]["executionMode"] == "AUTOPILOT"
    httpx.post(f"{FRONTEND_URL}/api/agent/configure", json={"executionMode": "ASSISTED"})


def test_proxy_and_direct_return_same_signals():
    direct = httpx.get(f"{FASTAPI_URL}/api/signals").json()["signals"]
    proxied = httpx.get(f"{FRONTEND_URL}/api/signals").json()["signals"]
    assert len(direct) == len(proxied)
    assert direct[0]["id"] == proxied[0]["id"]
