from dotenv import load_dotenv
load_dotenv()

import os
import random
import time
import asyncio
import base64
from typing import Optional

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(_simulation_loop())
    yield

app = FastAPI(title="SignalAI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Estado en memoria
# ---------------------------------------------------------------------------

signals: list = [
    {"id":"sig_1","token":"MONAD","signal":"BUY","confidence":0.92,"pattern":"Ascending Triangle Breakout","txHash":"0x7d9fcd124ea778badc35d9472ae6b29cf109ea2b8fe7ae2617f6cd00fe7dac2a","timestamp":int(time.time()*1000)-45000,"price":3.45,"targetPrice":3.85,"stopLoss":3.28,"status":"ACTIVE","result":"PENDING","timeframes":"1H","notes":"Aggressive visual breakout on Monad Testnet DEX."},
    {"id":"sig_2","token":"ETH","signal":"BUY","confidence":0.88,"pattern":"Bullish Flag","txHash":"0xa2b6e174a7bac3fc2ef9ff06bc1f92e76ca49511de45ff039cd8e40026e7fc8b","timestamp":int(time.time()*1000)-300000,"price":3450.25,"targetPrice":3620.0,"stopLoss":3390.0,"status":"ACTIVE","result":"PENDING","timeframes":"4H","notes":"Solid consolidation above key 50-period EMA."},
    {"id":"sig_3","token":"BTC","signal":"SELL","confidence":0.74,"pattern":"Double Top","txHash":"0x12f45eaef3a4cdb8ea003ae7f6312daef3b12eafeee72dafa00244ba0a91e123","timestamp":int(time.time()*1000)-1200000,"price":96800.0,"targetPrice":93500.0,"stopLoss":97850.0,"status":"ACTIVE","result":"PENDING","timeframes":"15M","notes":"Bearish divergence on RSI."},
    {"id":"sig_4","token":"SOL","signal":"BUY","confidence":0.68,"pattern":"EMA Cloud Squeeze","txHash":"0x9ef24baac910eff43431afb8932ef21398ea0a3fc45df992019ebad208761234","timestamp":int(time.time()*1000)-3600000,"price":182.5,"targetPrice":195.0,"stopLoss":177.2,"status":"COMPLETED","result":"PROFIT","pnl":6.85,"timeframes":"1D","notes":"Daily squeeze completed."},
    {"id":"sig_5","token":"MONAD","signal":"BUY","confidence":0.85,"pattern":"Cup & Handle","txHash":"0xb7c89fca6e1744bb6a301baee2d1a3cff0910eaaba372ffce019fa30ac0219ca","timestamp":int(time.time()*1000)-7200000,"price":3.12,"targetPrice":3.40,"stopLoss":2.98,"status":"COMPLETED","result":"PROFIT","pnl":8.97,"timeframes":"1H","notes":"Perfect cup & handle."},
    {"id":"sig_6","token":"LINK","signal":"SELL","confidence":0.71,"pattern":"Bearish Wedge","txHash":"0x2cd7f67ba3388fa9ce30ca10be2d3caa301aefbcde04efc301ae304fbad202cf","timestamp":int(time.time()*1000)-14400000,"price":18.25,"targetPrice":17.10,"stopLoss":18.80,"status":"COMPLETED","result":"PROFIT","pnl":6.30,"timeframes":"4H","notes":"Standard breakdown pattern."},
    {"id":"sig_7","token":"ETH","signal":"BUY","confidence":0.77,"pattern":"Bullish Flag","txHash":"0xd5e3fa2990cbfe3948daee1ba2d31aff09eaaca3cf47afccd019fbaefb2047fc","timestamp":int(time.time()*1000)-28000000,"price":3510.0,"targetPrice":3580.0,"stopLoss":3485.0,"status":"COMPLETED","result":"LOSS","pnl":-0.71,"timeframes":"1H","notes":"Volatility hit stop-loss."},
]

performance_stats: dict = {
    "winRate": 75.0, "totalSignals": 35, "completedSignals": 18, "totalPnl": 48.24,
    "accuracyHistory": [{"date":"06-01","rate":68},{"date":"06-02","rate":70},{"date":"06-03","rate":71},{"date":"06-04","rate":75},{"date":"06-05","rate":74},{"date":"06-06","rate":75}],
    "pnlHistory": [{"date":"06-01","value":12.5},{"date":"06-02","value":18.2},{"date":"06-03","value":24.1},{"date":"06-04","value":33.6},{"date":"06-05","value":41.2},{"date":"06-06","value":48.2}],
}

agent_state: dict = {
    "riskProfile": "CONSERVATIVE",
    "executionMode": "ASSISTED",
    "minCapitalLimit": 5000,
    "currentBalance": 12500,
    "startingBalance": 10000,
    "isOperating": True,
    "consecutiveLosses": 0,
    "opportunities": [
        {"id":"opp_1","token":"MONAD","signal":"BUY","confidence":0.94,"pattern":"Golden Cross Squeeze","price":3.42,"targetPrice":3.90,"stopLoss":3.25,"timeframe":"15M","reasoning":"Perfect golden cross on Monad L1.","expectedPnl":14.0},
        {"id":"opp_2","token":"ETH","signal":"BUY","confidence":0.89,"pattern":"Bullish Pennant","price":3452.12,"targetPrice":3750.00,"stopLoss":3380.00,"timeframe":"1H","reasoning":"EMA Cloud Squeeze with continuation bias.","expectedPnl":8.6},
    ],
    "logs": [{"id":"log_init","timestamp":int(time.time()*1000)-3600000,"type":"INFO","message":"Monad Predictive Engine started. Capital safety buffer calibrated."}],
}

# ---------------------------------------------------------------------------
# Funciones auxiliares
# ---------------------------------------------------------------------------

def _random_hash() -> str:
    return "0x" + "".join(random.choices("0123456789abcdef", k=64))


def add_agent_log(log_type: str, message: str):
    agent_state["logs"].insert(0, {
        "id": f"log_{int(time.time()*1000)}_{random.randint(0, 999)}",
        "timestamp": int(time.time() * 1000),
        "type": log_type,
        "message": message,
    })
    if len(agent_state["logs"]) > 40:
        agent_state["logs"].pop()


def execute_opportunity(opp: dict):
    if not agent_state["isOperating"]:
        add_agent_log("RISK_ALERT", "Execution Blocked: Agent is currently suspended.")
        return None
    alloc = {"CONSERVATIVE": 0.15, "INTERMEDIATE": 0.30, "RISKY": 0.50}.get(agent_state["riskProfile"], 0.15)
    allocated = round(agent_state["currentBalance"] * alloc, 2)
    if agent_state["currentBalance"] - allocated < agent_state["minCapitalLimit"]:
        add_agent_log("RISK_ALERT", f"Execution Blocked for {opp['token']}: Balance would fall below safety limit.")
        return None
    agent_state["currentBalance"] = round(agent_state["currentBalance"] - allocated, 2)
    new_signal = {
        "id": f"sig_agent_{int(time.time()):x}_{random.randint(0, 99)}",
        "token": opp["token"],
        "signal": opp["signal"],
        "confidence": opp["confidence"],
        "pattern": opp["pattern"],
        "txHash": _random_hash(),
        "timestamp": int(time.time() * 1000),
        "price": opp["price"],
        "targetPrice": opp["targetPrice"],
        "stopLoss": opp["stopLoss"],
        "status": "ACTIVE",
        "result": "PENDING",
        "timeframes": opp.get("timeframe", "1H"),
        "allocatedAmount": allocated,
        "notes": (
            f"Agent Position: {opp.get('reasoning', '')} "
            f"Capital Allocation: ${allocated:,.2f} MONAD "
            f"({round(alloc * 100)}% of portfolio under {agent_state['riskProfile']} parameters)."
        ),
    }
    signals.insert(0, new_signal)
    add_agent_log(
        "TRADE_OPEN",
        f"Opened position on {opp['token']}/USDC ({opp['signal']}) at ${opp['price']}. "
        f"Allocated ${allocated:,.2f} MONAD ({round(alloc * 100)}% portfolio).",
    )
    agent_state["opportunities"] = [o for o in agent_state["opportunities"] if o["id"] != opp["id"]]
    return new_signal

# ---------------------------------------------------------------------------
# Loop de simulación en background
# ---------------------------------------------------------------------------

async def _simulation_loop():
    while True:
        await asyncio.sleep(25)
        # 1. Cerrar posiciones activas con probabilidad aleatoria
        active = [s for s in signals if s["status"] == "ACTIVE"]
        if active and random.random() > 0.55:
            sig = random.choice(active)
            success = random.random() < sig.get("confidence", 0.78)
            pnl = round(random.uniform(4, 10), 2) if success else round(-random.uniform(1, 3), 2)
            allocated = sig.get("allocatedAmount", 1500)
            profit_loss = round(allocated * pnl / 100, 2)
            payout = round(allocated + profit_loss, 2)
            agent_state["currentBalance"] = round(agent_state["currentBalance"] + payout, 2)
            if success:
                agent_state["consecutiveLosses"] = 0
                add_agent_log(
                    "TRADE_CLOSE",
                    f"Position Closed: {sig['token']}/USDC hit Profit Target. Realized Profit: +{pnl}% (+${profit_loss} MONAD).",
                )
            else:
                agent_state["consecutiveLosses"] += 1
                add_agent_log(
                    "TRADE_CLOSE",
                    f"Position Closed: {sig['token']}/USDC triggered Stop Loss. Realized Loss: {pnl}% (${profit_loss} MONAD).",
                )
                if agent_state["consecutiveLosses"] >= 3:
                    if agent_state["riskProfile"] != "CONSERVATIVE":
                        agent_state["riskProfile"] = "CONSERVATIVE"
                        add_agent_log("RISK_ALERT", "Anti-Loss Rule: 3 consecutive losses. Downgraded to CONSERVATIVE.")
                    else:
                        agent_state["isOperating"] = False
                        add_agent_log("RISK_ALERT", "Anti-Loss Critical Stop: Agent suspended for safety audit.")
            for s in signals:
                if s["id"] == sig["id"]:
                    s["status"] = "COMPLETED"
                    s["result"] = "PROFIT" if success else "LOSS"
                    s["pnl"] = pnl
            completed = [s for s in signals if s["status"] == "COMPLETED"]
            wins = [s for s in completed if s["result"] == "PROFIT"]
            performance_stats["winRate"] = round(len(wins) / len(completed) * 100) if completed else 75
            performance_stats["completedSignals"] = len(completed)
            performance_stats["totalSignals"] = len(signals)
            performance_stats["totalPnl"] = round(sum(s.get("pnl", 0) for s in completed), 2)

        # 2. Generar nuevas opportunities
        if agent_state["isOperating"] and len(agent_state["opportunities"]) < 3 and random.random() > 0.4:
            tokens = ["MONAD", "DMONS", "NADP", "CHOG", "SOL", "ETH"]
            token = random.choice(tokens)
            action = "BUY" if random.random() > 0.2 else "SELL"
            patterns = [
                ("Double Bottom Reversal Squeeze", "Double bottom near strong L1 support."),
                ("Symmetrical Triangle Breakout", "Narrowing wedge consolidation breakout."),
                ("EMA Cloud Bounce", "Price rebounded off 50-EMA with orderbook support."),
                ("Wyckoff Accumulation Spring", "Liquidity grab near range support."),
            ]
            pat_name, pat_desc = random.choice(patterns)
            price_map = {"ETH": round(random.uniform(3380, 3580), 2), "SOL": round(random.uniform(175, 190), 2)}
            price = price_map.get(token, round(random.uniform(1.5, 9.5), 2))
            chg = 0.08 + random.random() * 0.05
            target = round(price * (1 + chg), 2) if action == "BUY" else round(price * (1 - chg), 2)
            sl = round(price * (1 - chg / 2), 2) if action == "BUY" else round(price * (1 + chg / 2), 2)
            new_opp = {
                "id": f"opp_{int(time.time()):x}_{random.randint(0, 99)}",
                "token": token,
                "signal": action,
                "confidence": round(0.82 + random.random() * 0.16, 2),
                "pattern": pat_name,
                "price": price,
                "targetPrice": target,
                "stopLoss": sl,
                "timeframe": random.choice(["5M", "15M", "1H"]),
                "reasoning": pat_desc,
                "expectedPnl": round(chg * 100, 1),
            }
            agent_state["opportunities"].append(new_opp)
            add_agent_log("DECISION", f"Identified Opportunity: Potential {action} on {token} ({pat_name}) at ${price}.")
            if agent_state["executionMode"] == "AUTOPILOT":
                execute_opportunity(new_opp)

        # 3. Background signal noise
        active_count = len([s for s in signals if s["status"] == "ACTIVE"])
        if active_count < 4 and random.random() > 0.7:
            token = random.choice(["DMONS", "CHOG", "USDC", "LINK"])
            direction = "BUY" if random.random() > 0.3 else "SELL"
            price = 1.0 if token == "USDC" else round(random.uniform(1, 7), 2)
            chg = price * (random.random() * 0.1 + 0.05)
            tp = round(price + chg, 2) if direction == "BUY" else round(price - chg, 2)
            sl = round(price - chg / 2, 2) if direction == "BUY" else round(price + chg / 2, 2)
            signals.insert(0, {
                "id": f"sig_bkg_{int(time.time()):x}",
                "token": token,
                "signal": direction,
                "confidence": round(random.uniform(0.70, 0.90), 2),
                "pattern": "Background Liquidity Swell",
                "txHash": _random_hash(),
                "timestamp": int(time.time() * 1000),
                "price": price,
                "targetPrice": tp,
                "stopLoss": sl,
                "status": "ACTIVE",
                "result": "PENDING",
                "timeframes": "15M",
                "notes": "Decentralized automated scan detected background liquidity swell.",
            })

# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ChartRequest(BaseModel):
    imageBase64: str
    filename: Optional[str] = None

class TradeRequest(BaseModel):
    token: str
    amount: float
    signal: str = "BUY"
    confidence: float = 0.75

class CreateSignalRequest(BaseModel):
    token: str
    signal: str
    confidence: float
    pattern: str
    price: float
    targetPrice: float
    stopLoss: float
    timeframe: str
    notes: Optional[str] = None

class ConfigureAgentRequest(BaseModel):
    riskProfile: Optional[str] = None
    executionMode: Optional[str] = None
    minCapitalLimit: Optional[float] = None
    isOperating: Optional[bool] = None

class OpportunityActionRequest(BaseModel):
    opportunityId: str

class CloseSignalRequest(BaseModel):
    signalId: str

# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Hello World"}

# ---------------------------------------------------------------------------
# Existing endpoints (updated)
# ---------------------------------------------------------------------------

@app.post("/api/analyze-chart")
async def analyze_chart(req: ChartRequest):
    from services.ai_analyzer import analyze_chart as _analyze
    try:
        image_bytes = base64.b64decode(req.imageBase64)
        analysis = await _analyze(image_bytes)
        new_signal = {
            "id": f"sig_ai_{int(time.time()):x}_{random.randint(0, 99)}",
            "token": analysis.get("token", "MONAD"),
            "signal": analysis.get("signal", "HOLD"),
            "confidence": analysis.get("confidence", 0.70),
            "pattern": analysis.get("pattern", "unknown"),
            "txHash": _random_hash(),
            "timestamp": int(time.time() * 1000),
            "price": analysis.get("price", 0.0),
            "targetPrice": analysis.get("targetPrice", 0.0),
            "stopLoss": analysis.get("stopLoss", 0.0),
            "status": "ACTIVE",
            "result": "PENDING",
            "timeframes": analysis.get("timeframe", "1H"),
            "indicators": analysis.get("indicators", []),
            "notes": analysis.get("explanation", ""),
        }
        signals.insert(0, new_signal)
        # E2E: 0x trade → Monad on-chain registration
        try:
            from services.trade_executor import execute_trade as _exec_trade
            from services.chain import record_signal as _record
            swap_tx = await _exec_trade(new_signal["token"], new_signal["signal"])
            monad_tx = await asyncio.get_event_loop().run_in_executor(
                None, _record,
                new_signal["token"], new_signal["signal"],
                analysis["confidence"], swap_tx,
            )
            new_signal["txHash"] = monad_tx
            return {"status": "ok", "analysis": analysis, "signal": new_signal, "mode": "live", "monad_tx_hash": monad_tx}
        except Exception:
            return {"status": "ok", "analysis": analysis, "signal": new_signal, "mode": "live"}
    except Exception as e:
        # Fallback simulation when AI call fails
        token = "MONAD"
        action = "BUY" if random.random() > 0.3 else "SELL"
        price = round(random.uniform(2.5, 4.5), 2)
        chg = 0.08 + random.random() * 0.05
        target = round(price * (1 + chg), 2) if action == "BUY" else round(price * (1 - chg), 2)
        sl = round(price * (1 - chg / 2), 2) if action == "BUY" else round(price * (1 + chg / 2), 2)
        confidence = round(0.72 + random.random() * 0.20, 2)
        fallback_analysis = {
            "token": token,
            "signal": action,
            "confidence": confidence,
            "pattern": "Simulated Pattern",
            "price": price,
            "targetPrice": target,
            "stopLoss": sl,
            "timeframe": "1H",
            "indicators": ["EMA50", "RSI"],
            "explanation": f"Simulation fallback: {str(e)}",
            "analysis": f"Simulation fallback: {str(e)}",
        }
        new_signal = {
            "id": f"sig_sim_{int(time.time()):x}_{random.randint(0, 99)}",
            "token": token,
            "signal": action,
            "confidence": confidence,
            "pattern": "Simulated Pattern",
            "txHash": _random_hash(),
            "timestamp": int(time.time() * 1000),
            "price": price,
            "targetPrice": target,
            "stopLoss": sl,
            "status": "ACTIVE",
            "result": "PENDING",
            "timeframes": "1H",
            "notes": f"Simulation fallback: {str(e)}",
        }
        signals.insert(0, new_signal)
        return {
            "status": "ok",
            "analysis": fallback_analysis,
            "signal": new_signal,
            "mode": "simulation",
        }


@app.post("/api/trade")
async def trade(req: TradeRequest):
    from services.trade_executor import execute_trade
    from services.chain import record_signal
    swap_tx = await execute_trade(req.token, req.signal, req.amount)
    try:
        monad_tx = await asyncio.get_event_loop().run_in_executor(
            None, record_signal, req.token, req.signal, req.confidence, swap_tx
        )
    except Exception:
        monad_tx = swap_tx
    return {"tx_hash": swap_tx, "monad_tx_hash": monad_tx, "token": req.token, "amount": req.amount, "signal": req.signal}

# ---------------------------------------------------------------------------
# Signal endpoints
# ---------------------------------------------------------------------------

@app.get("/api/signals")
async def get_signals():
    return {"status": "ok", "signals": signals}


@app.post("/api/signals")
async def create_signal(req: CreateSignalRequest):
    new_sig = {
        "id": f"sig_custom_{int(time.time()):x}",
        "token": req.token.upper(),
        "signal": req.signal,
        "confidence": req.confidence,
        "pattern": req.pattern,
        "txHash": _random_hash(),
        "timestamp": int(time.time() * 1000),
        "price": req.price,
        "targetPrice": req.targetPrice,
        "stopLoss": req.stopLoss,
        "status": "ACTIVE",
        "result": "PENDING",
        "timeframes": req.timeframe,
        "notes": req.notes or "Custom manual indicator mapping entered by dashboard operator.",
    }
    signals.insert(0, new_sig)
    return {"status": "ok", "signal": new_sig}

# ---------------------------------------------------------------------------
# Stats endpoint
# ---------------------------------------------------------------------------

@app.get("/api/stats")
async def get_stats():
    return {"status": "ok", "stats": performance_stats}

# ---------------------------------------------------------------------------
# Agent endpoints
# ---------------------------------------------------------------------------

@app.get("/api/agent/state")
async def get_agent_state():
    return {"status": "ok", "state": agent_state}


@app.post("/api/agent/configure")
async def configure_agent(req: ConfigureAgentRequest):
    if req.riskProfile in ("CONSERVATIVE", "INTERMEDIATE", "RISKY"):
        agent_state["riskProfile"] = req.riskProfile
        add_agent_log("INFO", f"Risk settings updated: Active model is now [{req.riskProfile}].")
    if req.executionMode in ("AUTOPILOT", "ASSISTED"):
        agent_state["executionMode"] = req.executionMode
        add_agent_log("INFO", f"Execution mode toggled to [{req.executionMode}].")
    if req.minCapitalLimit is not None:
        agent_state["minCapitalLimit"] = req.minCapitalLimit
        add_agent_log("INFO", f"Minimum capital limit reassigned to ${req.minCapitalLimit:,.0f} MONAD.")
    if req.isOperating is not None:
        agent_state["isOperating"] = req.isOperating
        add_agent_log("INFO", f"Automated operations: State toggled to [{'ACTIVE' if req.isOperating else 'PAUSED'}].")
    return {"status": "ok", "state": agent_state}


@app.post("/api/agent/opportunity/approve")
async def approve_opportunity(req: OpportunityActionRequest):
    opp = next((o for o in agent_state["opportunities"] if o["id"] == req.opportunityId), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    sig = execute_opportunity(opp)
    if not sig:
        raise HTTPException(status_code=400, detail="Execution blocked by active risk rules")
    return {"status": "ok", "signal": sig, "state": agent_state}


@app.post("/api/agent/opportunity/reject")
async def reject_opportunity(req: OpportunityActionRequest):
    exists = any(o["id"] == req.opportunityId for o in agent_state["opportunities"])
    if not exists:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    agent_state["opportunities"] = [o for o in agent_state["opportunities"] if o["id"] != req.opportunityId]
    add_agent_log("DECISION", f"Dismissed opportunity {req.opportunityId} from manual approval stack.")
    return {"status": "ok", "state": agent_state}


@app.post("/api/agent/signal/close")
async def close_signal(req: CloseSignalRequest):
    sig = next((s for s in signals if s["id"] == req.signalId), None)
    if not sig:
        raise HTTPException(status_code=404, detail="Signal not found")
    if sig["status"] != "ACTIVE":
        raise HTTPException(status_code=400, detail="Signal is not active")
    is_profit = random.random() > 0.4
    pnl = round(random.uniform(0.5, 3.5), 2) if is_profit else round(-random.uniform(0.2, 2.2), 2)
    allocated = sig.get("allocatedAmount", 1500)
    profit_loss = round(allocated * pnl / 100, 2)
    payout = round(allocated + profit_loss, 2)
    agent_state["currentBalance"] = round(agent_state["currentBalance"] + payout, 2)
    agent_state["consecutiveLosses"] = 0
    for s in signals:
        if s["id"] == req.signalId:
            s["status"] = "COMPLETED"
            s["result"] = "PROFIT" if is_profit else "LOSS"
            s["pnl"] = pnl
    add_agent_log("TRADE_CLOSE", f"Manual Exit: {sig['token']}/USDC closed early. PnL: {pnl:+}%.")
    return {"status": "ok", "state": agent_state, "signals": signals}


@app.post("/api/agent/reset")
async def reset_agent():
    agent_state["currentBalance"] = 12500
    agent_state["minCapitalLimit"] = 5000
    agent_state["riskProfile"] = "CONSERVATIVE"
    agent_state["executionMode"] = "ASSISTED"
    agent_state["isOperating"] = True
    agent_state["consecutiveLosses"] = 0
    agent_state["opportunities"] = [
        {"id":"opp_init_1","token":"MONAD","signal":"BUY","confidence":0.94,"pattern":"Golden Cross Squeeze","price":3.42,"targetPrice":3.90,"stopLoss":3.25,"timeframe":"15M","reasoning":"Perfect golden cross on Monad L1.","expectedPnl":14.0},
    ]
    agent_state["logs"] = [
        {"id":"log_reset","timestamp":int(time.time()*1000),"type":"INFO","message":"Monad Predictive Engine reset completed."},
    ]
    return {"status": "ok", "state": agent_state}


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health():
    import httpx as _httpx
    checks: dict = {}

    # Monad RPC
    try:
        from web3 import Web3 as _Web3
        _w3 = _Web3(_Web3.HTTPProvider(os.getenv("MONAD_RPC", "")))
        block = _w3.eth.block_number
        checks["monad_rpc"] = {"status": "ok", "block": block}
    except Exception as e:
        checks["monad_rpc"] = {"status": "error", "detail": str(e)}

    # Contract
    try:
        _addr = os.getenv("CONTRACT_ADDRESS", "")
        _abi = [{"inputs":[],"name":"getSignalsCount","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
        _contract = _w3.eth.contract(address=_addr, abi=_abi)
        count = _contract.functions.getSignalsCount().call()
        checks["contract"] = {"status": "ok", "signals_count": count, "address": _addr}
    except Exception as e:
        checks["contract"] = {"status": "error", "detail": str(e)}

    # Anthropic
    try:
        import anthropic as _anthropic
        _client = _anthropic.AsyncAnthropic()
        msg = await _client.messages.create(
            model="claude-haiku-4-5-20251001", max_tokens=5,
            messages=[{"role": "user", "content": "OK"}],
        )
        checks["anthropic"] = {"status": "ok", "model": "claude-haiku-4-5-20251001"}
    except Exception as e:
        checks["anthropic"] = {"status": "error", "detail": str(e)}

    # Telegram
    try:
        _token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        async with _httpx.AsyncClient() as _c:
            r = await _c.get(f"https://api.telegram.org/bot{_token}/getMe", timeout=5.0)
        bot_data = r.json().get("result", {})
        checks["telegram"] = {"status": "ok", "bot_username": bot_data.get("username")}
    except Exception as e:
        checks["telegram"] = {"status": "error", "detail": str(e)}

    overall = "ok" if all(v["status"] == "ok" for v in checks.values()) else "degraded"
    return {"status": overall, "checks": checks}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
