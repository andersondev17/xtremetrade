import base64
import pytest
from fastapi.testclient import TestClient

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app, signals, agent_state

client = TestClient(app)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert "message" in r.json()


# ---------------------------------------------------------------------------
# Signals
# ---------------------------------------------------------------------------

def test_get_signals_returns_seeded_list():
    r = client.get("/api/signals")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert isinstance(data["signals"], list)
    assert len(data["signals"]) >= 7


def test_create_signal():
    payload = {
        "token": "TEST",
        "signal": "BUY",
        "confidence": 0.88,
        "pattern": "Test Pattern",
        "price": 1.00,
        "targetPrice": 1.10,
        "stopLoss": 0.95,
        "timeframe": "1H",
        "notes": "automated test signal",
    }
    r = client.post("/api/signals", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    sig = data["signal"]
    assert sig["token"] == "TEST"
    assert sig["signal"] == "BUY"
    assert sig["status"] == "ACTIVE"
    assert sig["txHash"].startswith("0x")
    assert "timestamp" in sig


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

def test_get_stats():
    r = client.get("/api/stats")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    stats = data["stats"]
    assert "winRate" in stats
    assert "pnlHistory" in stats
    assert "accuracyHistory" in stats


# ---------------------------------------------------------------------------
# Agent state
# ---------------------------------------------------------------------------

def test_get_agent_state():
    r = client.get("/api/agent/state")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    state = data["state"]
    assert state["riskProfile"] in ("CONSERVATIVE", "INTERMEDIATE", "RISKY")
    assert state["executionMode"] in ("AUTOPILOT", "ASSISTED")
    assert isinstance(state["opportunities"], list)
    assert isinstance(state["logs"], list)


def test_configure_agent_risk_profile():
    r = client.post("/api/agent/configure", json={"riskProfile": "INTERMEDIATE"})
    assert r.status_code == 200
    data = r.json()
    assert data["state"]["riskProfile"] == "INTERMEDIATE"
    # Restore
    client.post("/api/agent/configure", json={"riskProfile": "CONSERVATIVE"})


def test_configure_agent_execution_mode():
    r = client.post("/api/agent/configure", json={"executionMode": "AUTOPILOT"})
    assert r.status_code == 200
    assert r.json()["state"]["executionMode"] == "AUTOPILOT"
    client.post("/api/agent/configure", json={"executionMode": "ASSISTED"})


def test_configure_agent_invalid_profile_ignored():
    original = client.get("/api/agent/state").json()["state"]["riskProfile"]
    r = client.post("/api/agent/configure", json={"riskProfile": "YOLO"})
    assert r.status_code == 200
    assert r.json()["state"]["riskProfile"] == original


# ---------------------------------------------------------------------------
# Opportunities
# ---------------------------------------------------------------------------

def test_reject_opportunity():
    state = client.get("/api/agent/state").json()["state"]
    opps = state["opportunities"]
    if not opps:
        pytest.skip("no opportunities seeded")
    opp_id = opps[0]["id"]
    r = client.post("/api/agent/opportunity/reject", json={"opportunityId": opp_id})
    assert r.status_code == 200
    ids_after = [o["id"] for o in r.json()["state"]["opportunities"]]
    assert opp_id not in ids_after


def test_reject_nonexistent_opportunity_returns_404():
    r = client.post("/api/agent/opportunity/reject", json={"opportunityId": "nonexistent_id"})
    assert r.status_code == 404


def test_approve_opportunity():
    # Reset first so we have a clean state with known opportunities
    client.post("/api/agent/reset")
    state = client.get("/api/agent/state").json()["state"]
    opps = state["opportunities"]
    if not opps:
        pytest.skip("no opportunities after reset")
    opp_id = opps[0]["id"]
    r = client.post("/api/agent/opportunity/approve", json={"opportunityId": opp_id})
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "signal" in data
    assert data["signal"]["status"] == "ACTIVE"


# ---------------------------------------------------------------------------
# Signal close
# ---------------------------------------------------------------------------

def test_close_active_signal():
    # Create a signal to close
    client.post("/api/signals", json={
        "token": "CLOSE_TEST", "signal": "BUY", "confidence": 0.80,
        "pattern": "Test", "price": 1.0, "targetPrice": 1.1, "stopLoss": 0.9, "timeframe": "1H",
    })
    signals_list = client.get("/api/signals").json()["signals"]
    active = [s for s in signals_list if s["status"] == "ACTIVE"]
    assert active, "no active signals to close"
    sig_id = active[0]["id"]
    r = client.post("/api/agent/signal/close", json={"signalId": sig_id})
    assert r.status_code == 200
    closed = next(s for s in r.json()["signals"] if s["id"] == sig_id)
    assert closed["status"] == "COMPLETED"
    assert "pnl" in closed


def test_close_nonexistent_signal_returns_404():
    r = client.post("/api/agent/signal/close", json={"signalId": "nonexistent"})
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Reset
# ---------------------------------------------------------------------------

def test_reset_agent():
    # Dirty the state first
    client.post("/api/agent/configure", json={"executionMode": "AUTOPILOT", "minCapitalLimit": 9999})
    r = client.post("/api/agent/reset")
    assert r.status_code == 200
    state = r.json()["state"]
    assert state["executionMode"] == "ASSISTED"
    assert state["minCapitalLimit"] == 5000
    assert state["currentBalance"] == 12500
    assert state["consecutiveLosses"] == 0


# ---------------------------------------------------------------------------
# Analyze chart (simulation fallback — no real image needed)
# ---------------------------------------------------------------------------

def test_analyze_chart_simulation_fallback():
    # Send a 1x1 white PNG as base64 — AI will likely fail/return simulation
    tiny_png = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    )
    r = client.post("/api/analyze-chart", json={"imageBase64": tiny_png, "filename": "test.png"})
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "analysis" in data
    assert "signal" in data
    analysis = data["analysis"]
    assert "signal" in analysis
    assert analysis["signal"] in ("BUY", "SELL", "HOLD")
    assert 0.0 <= analysis["confidence"] <= 1.0
    assert data["signal"]["txHash"].startswith("0x")
