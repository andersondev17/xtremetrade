import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase payload limit for chart image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Setup Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient) {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("GEMINI_API_KEY is missing or contains a placeholder. Server will operate in advanced simulation fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Global In-memory Signal Storage
// Let's seed with beautiful, realistic signals on Monad Network
let signals: any[] = [
  {
    id: "sig_1",
    token: "MONAD",
    signal: "BUY" as const,
    confidence: 0.92,
    pattern: "Ascending Triangle Breakout",
    txHash: "0x7d9fcd124ea778badc35d9472ae6b29cf109ea2b8fe7ae2617f6cd00fe7dac2a",
    timestamp: Date.now() - 45000,
    price: 3.45,
    targetPrice: 3.85,
    stopLoss: 3.28,
    status: "ACTIVE" as const,
    result: "PENDING" as const,
    timeframes: "1H",
    notes: "Aggressive visual breakout on Monad Testnet DEX liquidity pools with heavy volumetric support."
  },
  {
    id: "sig_2",
    token: "ETH",
    signal: "BUY" as const,
    confidence: 0.88,
    pattern: "Bullish Flag",
    txHash: "0xa2b6e174a7bac3fc2ef9ff06bc1f92e76ca49511de45ff039cd8e40026e7fc8b",
    timestamp: Date.now() - 300000,
    price: 3450.25,
    targetPrice: 3620.0,
    stopLoss: 3390.0,
    status: "ACTIVE" as const,
    result: "PENDING" as const,
    timeframes: "4H",
    notes: "Solid consolidation range above key 50-period EMA on 4H candles. Orderbook depth hints at upward pressure."
  },
  {
    id: "sig_3",
    token: "BTC",
    signal: "SELL" as const,
    confidence: 0.74,
    pattern: "Double Top",
    txHash: "0x12f45eaef3a4cdb8ea003ae7f6312daef3b12eafeee72dafa00244ba0a91e123",
    timestamp: Date.now() - 1200000,
    price: 96800.0,
    targetPrice: 93500.0,
    stopLoss: 97850.0,
    status: "ACTIVE" as const,
    result: "PENDING" as const,
    timeframes: "15M",
    notes: "Bearish divergence on RSI combined with secondary refusal at key resistance level on lower timeframes."
  },
  {
    id: "sig_4",
    token: "SOL",
    signal: "BUY" as const,
    confidence: 0.68,
    pattern: "EMA Cloud Squeeze",
    txHash: "0x9ef24baac910eff43431afb8932ef21398ea0a3fc45df992019ebad208761234",
    timestamp: Date.now() - 3600000,
    price: 182.5,
    targetPrice: 195.0,
    stopLoss: 177.2,
    status: "COMPLETED" as const,
    result: "PROFIT" as const,
    pnl: 6.85,
    timeframes: "1D",
    notes: "Daily squeeze completed. Successfully reached intermediate profit target of $195.0."
  },
  {
    id: "sig_5",
    token: "MONAD",
    signal: "BUY" as const,
    confidence: 0.85,
    pattern: "Cup & Handle",
    txHash: "0xb7c89fca6e1744bb6a301baee2d1a3cff0910eaaba372ffce019fa30ac0219ca",
    timestamp: Date.now() - 7200000,
    price: 3.12,
    targetPrice: 3.40,
    stopLoss: 2.98,
    status: "COMPLETED" as const,
    result: "PROFIT" as const,
    pnl: 8.97,
    timeframes: "1H",
    notes: "A perfect standard cup & handle pattern on MONAD. Hit taking-profit target precisely at $3.40."
  },
  {
    id: "sig_6",
    token: "LINK",
    signal: "SELL" as const,
    confidence: 0.71,
    pattern: "Bearish Wedge",
    txHash: "0x2cd7f67ba3388fa9ce30ca10be2d3caa301aefbcde04efc301ae304fbad202cf",
    timestamp: Date.now() - 14400000,
    price: 18.25,
    targetPrice: 17.10,
    stopLoss: 18.80,
    status: "COMPLETED" as const,
    result: "PROFIT" as const,
    pnl: 6.30,
    timeframes: "4H",
    notes: "Standard breakdown pattern with volume confirming weakness on the resistance line."
  },
  {
    id: "sig_7",
    token: "ETH",
    signal: "BUY" as const,
    confidence: 0.77,
    pattern: "Bullish Flag",
    txHash: "0xd5e3fa2990cbfe3948daee1ba2d31aff09eaaca3cf47afccd019fbaefb2047fc",
    timestamp: Date.now() - 28000000,
    price: 3510.0,
    targetPrice: 3580.0,
    stopLoss: 3485.0,
    status: "COMPLETED" as const,
    result: "LOSS" as const,
    pnl: -0.71,
    timeframes: "1H",
    notes: "Volatility spikes hit stop-loss level before market reversed. Correct capital management triggered protective exit."
  }
];

// Seed some performance numbers
let performanceStats = {
  winRate: 75.0,
  totalSignals: 35,
  completedSignals: 18,
  totalPnl: 48.24,
  accuracyHistory: [
    { date: "06-01", rate: 68 },
    { date: "06-02", rate: 70 },
    { date: "06-03", rate: 71 },
    { date: "06-04", rate: 75 },
    { date: "06-05", rate: 74 },
    { date: "06-06", rate: 75 }
  ],
  pnlHistory: [
    { date: "06-01", value: 12.5 },
    { date: "06-02", value: 18.2 },
    { date: "06-03", value: 24.1 },
    { date: "06-04", value: 33.6 },
    { date: "06-05", value: 41.2 },
    { date: "06-06", value: 48.2 }
  ]
};

// IN-MEMORY AGENT STATE
let agentState = {
  riskProfile: "CONSERVATIVE" as "CONSERVATIVE" | "INTERMEDIATE" | "RISKY",
  executionMode: "ASSISTED" as "AUTOPILOT" | "ASSISTED",
  minCapitalLimit: 5000,
  currentBalance: 12500,
  startingBalance: 10000,
  isOperating: true,
  consecutiveLosses: 0,
  opportunities: [
    {
      id: "opp_1",
      token: "MONAD",
      signal: "BUY" as "BUY" | "SELL",
      confidence: 0.94,
      pattern: "Golden Cross Squeeze",
      price: 3.42,
      targetPrice: 3.90,
      stopLoss: 3.25,
      timeframe: "15M",
      reasoning: "A perfect standard golden cross observed on lower timeframes on Monad L1. Liquidity pool volumes are surging.",
      expectedPnl: 14.0
    },
    {
      id: "opp_2",
      token: "ETH",
      signal: "BUY" as "BUY" | "SELL",
      confidence: 0.89,
      pattern: "Bullish Pennant",
      price: 3452.12,
      targetPrice: 3750.00,
      stopLoss: 3380.00,
      timeframe: "1H",
      reasoning: "EMA Cloud Squeeze with standard continuation bias. Higher probability option.",
      expectedPnl: 8.6
    }
  ],
  logs: [
    {
      id: "log_init",
      timestamp: Date.now() - 3600000,
      type: "INFO" as "INFO" | "TRADE_OPEN" | "TRADE_CLOSE" | "RISK_ALERT" | "DECISION",
      message: "Monad Predictive Engine started. Capital safety buffer calibrated."
    }
  ]
};

function addAgentLog(type: "INFO" | "TRADE_OPEN" | "TRADE_CLOSE" | "RISK_ALERT" | "DECISION", message: string) {
  agentState.logs.unshift({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    type,
    message
  });
  if (agentState.logs.length > 40) {
    agentState.logs.pop();
  }
}

function executeOpportunity(opp: any) {
  if (!agentState.isOperating) {
    addAgentLog("RISK_ALERT", `Execution Blocked: Agent is currently suspended/stopped.`);
    return null;
  }

  let allocationPercent = 0.50; 
  if (agentState.riskProfile === "CONSERVATIVE") {
    allocationPercent = 0.15;
  } else if (agentState.riskProfile === "INTERMEDIATE") {
    allocationPercent = 0.30;
  } else if (agentState.riskProfile === "RISKY") {
    allocationPercent = 0.50;
  }

  const allocatedAmount = +(agentState.currentBalance * allocationPercent).toFixed(2);

  if (agentState.currentBalance - allocatedAmount < agentState.minCapitalLimit) {
    addAgentLog("RISK_ALERT", `Execution Blocked for ${opp.token}: Balance after trade ($${(agentState.currentBalance - allocatedAmount).toFixed(2)} MONAD) would fall below safety limit ($${agentState.minCapitalLimit} MONAD).`);
    return null;
  }

  agentState.currentBalance = +(agentState.currentBalance - allocatedAmount).toFixed(2);

  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }

  const newSignal = {
    id: "sig_agent_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 100),
    token: opp.token,
    signal: opp.signal,
    confidence: opp.confidence,
    pattern: opp.pattern,
    txHash: hash,
    timestamp: Date.now(),
    price: opp.price,
    targetPrice: opp.targetPrice,
    stopLoss: opp.stopLoss,
    status: "ACTIVE" as const,
    result: "PENDING" as const,
    timeframes: opp.timeframe,
    allocatedAmount: allocatedAmount,
    notes: `🤖 Agent Position: ${opp.reasoning || "Executed based on AI quantitative scan pattern."} Capital Allocation: $${allocatedAmount.toLocaleString()} MONAD (${Math.round(allocationPercent * 100)}% of portfolio under ${agentState.riskProfile} parameters).`
  };

  signals.unshift(newSignal);
  addAgentLog("TRADE_OPEN", `Opened position on ${opp.token}/USDC (${opp.signal}) at $${opp.price}. Allocated $${allocatedAmount.toLocaleString()} MONAD (${Math.round(allocationPercent * 100)}% portfolio).`);

  agentState.opportunities = agentState.opportunities.filter(o => o.id !== opp.id);
  return newSignal;
}

// Automatic simulation loop:
// We simulate live updates so that users have a highly visual, realistic "monitoring session" experience.
// Every 25 seconds, we run the automated agent checks and opportunity discovery.
setInterval(() => {
  // 1. Manage outstanding active positions
  const activeAgentSignals = signals.filter(s => s.status === "ACTIVE");
  if (activeAgentSignals.length > 0) {
    if (Math.random() > 0.55) {
      const signalToClose = activeAgentSignals[Math.floor(Math.random() * activeAgentSignals.length)];
      
      const isSuccess = Math.random() < (signalToClose.confidence || 0.78);
      const pnlPercent = isSuccess 
        ? +(Math.random() * 6 + 4).toFixed(2)
        : -(Math.random() * 3 + 1).toFixed(2);
      
      const allocated = signalToClose.allocatedAmount || 1500;
      const profitOrLossAmount = +(allocated * (pnlPercent / 100)).toFixed(2);
      const payout = +(allocated + profitOrLossAmount).toFixed(2);
      
      agentState.currentBalance = +(agentState.currentBalance + payout).toFixed(2);

      if (isSuccess) {
        agentState.consecutiveLosses = 0;
        addAgentLog("TRADE_CLOSE", `Position Closed: ${signalToClose.token}/USDC hit Profit Target of $${signalToClose.targetPrice}! Realized Profit: +${pnlPercent}% (+$${profitOrLossAmount} MONAD). Current Balance: $${agentState.currentBalance.toLocaleString()} MONAD.`);
      } else {
        agentState.consecutiveLosses++;
        addAgentLog("TRADE_CLOSE", `Position Closed: ${signalToClose.token}/USDC triggered Stop Loss at $${signalToClose.stopLoss}. Realized Loss: ${pnlPercent}% (-$${Math.abs(profitOrLossAmount)} MONAD). Current Balance: $${agentState.currentBalance.toLocaleString()} MONAD.`);

        if (agentState.consecutiveLosses >= 3) {
          if (agentState.riskProfile !== "CONSERVATIVE") {
            agentState.riskProfile = "CONSERVATIVE";
            addAgentLog("RISK_ALERT", `Anti-Loss Rule Triggered: 3 consecutive losses detected. Downgraded Risk Profile to CONSERVATIVE to safeguard capital.`);
          } else {
            agentState.isOperating = false;
            addAgentLog("RISK_ALERT", `Anti-Loss Critical Stop: 3 consecutive losses under CONSERVATIVE rules. Temporarily suspended automated agent operations for safety audit.`);
          }
        }
      }

      signals = signals.map(s => {
        if (s.id === signalToClose.id) {
          return {
            ...s,
            status: "COMPLETED" as const,
            result: isSuccess ? ("PROFIT" as const) : ("LOSS" as const),
            pnl: pnlPercent,
            notes: s.notes + ` [Position closed automatically: ${isSuccess ? "TakeProfit target reached" : "StopLoss protective boundary hit"}. Balance synchronized.]`
          };
        }
        return s;
      });

      const completed = signals.filter(s => s.status === "COMPLETED");
      const wins = completed.filter(s => s.result === "PROFIT");
      const winRate = completed.length > 0 ? (wins.length / completed.length) * 100 : 75;
      const totalPnlSum = completed.reduce((sum, s) => sum + (s.pnl || 0), 0);

      performanceStats.winRate = Math.round(winRate);
      performanceStats.completedSignals = completed.length;
      performanceStats.totalSignals = signals.length;
      performanceStats.totalPnl = +totalPnlSum.toFixed(2);

      const todayStr = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }).replace("/", "-");
      const lastHistory = performanceStats.pnlHistory[performanceStats.pnlHistory.length - 1];
      if (lastHistory && lastHistory.date === todayStr) {
        performanceStats.pnlHistory[performanceStats.pnlHistory.length - 1].value = performanceStats.totalPnl;
        performanceStats.accuracyHistory[performanceStats.accuracyHistory.length - 1].rate = performanceStats.winRate;
      } else {
        performanceStats.pnlHistory.push({ date: todayStr, value: performanceStats.totalPnl });
        performanceStats.accuracyHistory.push({ date: todayStr, rate: performanceStats.winRate });
      }
    }
  }

  // 2. Discover/Generate new market opportunities
  if (agentState.isOperating) {
    if (agentState.opportunities.length < 3 && Math.random() > 0.4) {
      const tokensList = ["MONAD", "DMONS", "NADP", "CHOG", "SOL", "ETH"];
      const token = tokensList[Math.floor(Math.random() * tokensList.length)];
      const action = Math.random() > 0.2 ? ("BUY" as const) : ("SELL" as const);
      
      const opportunityPatterns = [
        { name: "Double Bottom Reversal Squeeze", desc: "Granular double bottom formation consolidating near strong L1 market support." },
        { name: "Symmetrical Rising Triangle Breakout", desc: "Narrowing wedge consolidation breakout. Volumetric indices are surging." },
        { name: "EMA Cloud Convergence Bounce", desc: "Price tested the 50-EMA line and rebounded beautifully with solid orderbook support." },
        { name: "Wyckoff Accumulation Spring", desc: "Liquidity grab near range support limits. High-confidence buy signal detected." }
      ];
      
      const selectedPattern = opportunityPatterns[Math.floor(Math.random() * opportunityPatterns.length)];
      let price = +(Math.random() * 8 + 1.5).toFixed(2);
      if (token === "ETH") price = +(Math.random() * 200 + 3380).toFixed(2);
      if (token === "SOL") price = +(Math.random() * 15 + 175).toFixed(2);
      
      const changePercent = 0.08 + Math.random() * 0.05;
      const targetPrice = action === "BUY" ? +(price * (1 + changePercent)).toFixed(2) : +(price * (1 - changePercent)).toFixed(2);
      const stopLoss = action === "BUY" ? +(price * (1 - changePercent / 2)).toFixed(2) : +(price * (1 + changePercent / 2)).toFixed(2);

      const newOpp = {
        id: "opp_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 100),
        token,
        signal: action,
        confidence: +(0.82 + Math.random() * 0.16).toFixed(2),
        pattern: selectedPattern.name,
        price,
        targetPrice,
        stopLoss,
        timeframe: ["5M", "15M", "1H"][Math.floor(Math.random() * 3)],
        reasoning: selectedPattern.desc,
        expectedPnl: +(changePercent * 100).toFixed(1)
      };

      agentState.opportunities.push(newOpp);
      addAgentLog("DECISION", `Identified Opportunity: Potential ${action} on ${token} (${selectedPattern.name}) at $${price}. Target potential: +${newOpp.expectedPnl}% with ${Math.round(newOpp.confidence * 100)}% confidence.`);

      if (agentState.executionMode === "AUTOPILOT") {
        executeOpportunity(newOpp);
      }
    }
  }

  // 3. Keep background transaction log synced with random non-agent signals
  if (signals.filter(s => s.status === "ACTIVE").length < 4 && Math.random() > 0.7) {
    const backgroundTokens = ["DMONS", "CHOG", "USDC", "LINK"];
    const token = backgroundTokens[Math.floor(Math.random() * backgroundTokens.length)];
    const signalDir = Math.random() > 0.3 ? ("BUY" as const) : ("SELL" as const);
    let price = +(Math.random() * 6 + 1).toFixed(2);
    if (token === "USDC") price = 1.00;
    
    const change = price * (Math.random() * 0.1 + 0.05);
    const targetPrice = signalDir === "BUY" ? +(price + change).toFixed(2) : +(price - change).toFixed(2);
    const stopLoss = signalDir === "BUY" ? +(price - change / 2).toFixed(2) : +(price + change / 2).toFixed(2);

    const chars = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }

    const newSig = {
      id: "sig_bkg_" + Date.now().toString(36),
      token,
      signal: signalDir,
      confidence: +(Math.random() * 0.2 + 0.7).toFixed(2),
      pattern: "Background Liquidity Swell",
      txHash: hash,
      timestamp: Date.now(),
      price,
      targetPrice,
      stopLoss,
      status: "ACTIVE" as const,
      result: "PENDING" as const,
      timeframes: "15M",
      notes: "Decentralized automated block synchronization scan detected a background liquidity swell."
    };
    signals.unshift(newSig);
  }
}, 25000);


// API ENDPOINTS

// GET current automated agent state
app.get("/api/agent/state", (req, res) => {
  res.json({
    status: "ok",
    state: agentState
  });
});

// POST update agent configurations
app.post("/api/agent/configure", (req, res) => {
  const { riskProfile, executionMode, minCapitalLimit, isOperating } = req.body;

  if (riskProfile !== undefined) {
    if (["CONSERVATIVE", "INTERMEDIATE", "RISKY"].includes(riskProfile)) {
      agentState.riskProfile = riskProfile;
      addAgentLog("INFO", `Risk settings updated: Active model is now [${riskProfile}].`);
    }
  }

  if (executionMode !== undefined) {
    if (["AUTOPILOT", "ASSISTED"].includes(executionMode)) {
      agentState.executionMode = executionMode;
      addAgentLog("INFO", `Execution mode toggled to [${executionMode}].`);
    }
  }

  if (minCapitalLimit !== undefined && !isNaN(Number(minCapitalLimit))) {
    agentState.minCapitalLimit = Number(minCapitalLimit);
    addAgentLog("INFO", `Minimum capital protective limit reassigned to $${Number(minCapitalLimit).toLocaleString()} MONAD.`);
  }

  if (isOperating !== undefined) {
    agentState.isOperating = !!isOperating;
    addAgentLog("INFO", `Automated operations: State toggled to [${!!isOperating ? "ACTIVE" : "PAUSED"}].`);
  }

  res.json({
    status: "ok",
    state: agentState
  });
});

// POST manually approve an opportunity to convert it to an active signal trade
app.post("/api/agent/opportunity/approve", (req, res) => {
  const { opportunityId } = req.body;
  const opp = agentState.opportunities.find(o => o.id === opportunityId);

  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found in trace list" });
  }

  const signal = executeOpportunity(opp);
  if (!signal) {
    return res.status(400).json({ error: "Opportunity execution blocked by active risk rules" });
  }

  res.json({
    status: "ok",
    signal,
    state: agentState
  });
});

// POST manually reject an opportunity
app.post("/api/agent/opportunity/reject", (req, res) => {
  const { opportunityId } = req.body;
  const exists = agentState.opportunities.some(o => o.id === opportunityId);

  if (exists) {
    agentState.opportunities = agentState.opportunities.filter(o => o.id !== opportunityId);
    addAgentLog("DECISION", `Dismissed opportunity opportunityId:${opportunityId} from manual approval stack.`);
    res.json({ status: "ok", state: agentState });
  } else {
    res.status(404).json({ error: "Opportunity not found" });
  }
});

// POST manually close an active signal early to secure profits/losses
app.post("/api/agent/signal/close", (req, res) => {
  const { signalId } = req.body;
  const signalToClose = signals.find(s => s.id === signalId);

  if (!signalToClose) {
    return res.status(404).json({ error: "Active signal not found" });
  }

  if (signalToClose.status !== "ACTIVE") {
    return res.status(400).json({ error: "Signal is not active and cannot be closed" });
  }

  const isProfit = Math.random() > 0.4;
  const pnlPercent = isProfit 
    ? +(Math.random() * 3 + 0.5).toFixed(2)
    : -(Math.random() * 2 + 0.2).toFixed(2);

  const allocated = signalToClose.allocatedAmount || 1500;
  const profitOrLossAmount = +(allocated * (pnlPercent / 100)).toFixed(2);
  const payout = +(allocated + profitOrLossAmount).toFixed(2);

  agentState.currentBalance = +(agentState.currentBalance + payout).toFixed(2);
  agentState.consecutiveLosses = 0;

  signals = signals.map(s => {
    if (s.id === signalId) {
      return {
        ...s,
        status: "COMPLETED" as const,
        result: isProfit ? ("PROFIT" as const) : ("LOSS" as const),
        pnl: pnlPercent,
        notes: s.notes + ` [Early manual close triggered by user. Position closed early with ${pnlPercent}% gain/loss.]`
      };
    }
    return s;
  });

  addAgentLog("TRADE_CLOSE", `Manual Exit: Operator shut down ${signalToClose.token}/USDC position prematurely. Realized PnL: ${pnlPercent > 0 ? "+" : ""}${pnlPercent}% (+$${profitOrLossAmount} MONAD). Updated Balance: $${agentState.currentBalance.toLocaleString()} MONAD.`);

  res.json({
    status: "ok",
    state: agentState,
    signals
  });
});

// POST reset agent dashboard
app.post("/api/agent/reset", (req, res) => {
  agentState.currentBalance = 12500;
  agentState.minCapitalLimit = 5000;
  agentState.riskProfile = "CONSERVATIVE";
  agentState.executionMode = "ASSISTED";
  agentState.isOperating = true;
  agentState.consecutiveLosses = 0;
  agentState.opportunities = [
    {
      id: "opp_init_1",
      token: "MONAD",
      signal: "BUY" as const,
      confidence: 0.94,
      pattern: "Golden Cross Squeeze",
      price: 3.42,
      targetPrice: 3.90,
      stopLoss: 3.25,
      timeframe: "15M",
      reasoning: "A perfect standard golden cross observed on lower timeframes on Monad L1. Liquidity pool volumes are surging.",
      expectedPnl: 14.0
    }
  ];
  agentState.logs = [
    {
      id: "log_reset",
      timestamp: Date.now(),
      type: "INFO" as const,
      message: "Monad Predictive Engine reset completed. Capital parameters re-initialized."
    }
  ];

  res.json({
    status: "ok",
    state: agentState
  });
});

// 1. GET current and completed signals list
app.get("/api/signals", (req, res) => {
  res.json({
    status: "ok",
    signals
  });
});

// 2. GET current system-wide stats
app.get("/api/stats", (req, res) => {
  res.json({
    status: "ok",
    stats: performanceStats
  });
});

// 3. POST force create a custom test signal
app.post("/api/signals", (req, res) => {
  const { token, signal, confidence, pattern, price, targetPrice, stopLoss, timeframe, notes } = req.body;
  
  if (!token || !signal) {
    return res.status(400).json({ error: "Missing token or signal parameter" });
  }

  // Generate a random EVM Monad scan transaction hash
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }

  const newSignal = {
    id: "sig_custom_" + Date.now().toString(36),
    token: String(token).toUpperCase(),
    signal: (signal === "SELL" ? "SELL" : signal === "HOLD" ? "HOLD" : "BUY") as any,
    confidence: Number(confidence) || 0.82,
    pattern: String(pattern || "Manual Analysis Frame"),
    txHash: hash,
    timestamp: Date.now(),
    price: Number(price) || 1.00,
    targetPrice: Number(targetPrice) || 1.10,
    stopLoss: Number(stopLoss) || 0.95,
    status: "ACTIVE" as const,
    result: "PENDING" as const,
    timeframes: String(timeframe || "1H"),
    notes: String(notes || "Custom manual indicator mapping entered by dashboard operator.")
  };

  signals.unshift(newSignal);
  res.json({ status: "ok", signal: newSignal });
});


// 4. POST analyze-chart
// Accepts an uploaded chart image in base64 format and runs visual pattern recognition via Gemini.
app.post("/api/analyze-chart", async (req, res) => {
  const { imageBase64, filename } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Missing imageBase64 chart file string in body" });
  }

  // Strip prefix like "data:image/png;base64," if it exists
  const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  let mimeType = "image/png";
  let base64Data = imageBase64;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    base64Data = matches[2];
  }

  const ai = getGeminiClient();

  // Definition of the Gemini Structured Output Schema
  const schema = {
    type: Type.OBJECT,
    properties: {
      token: { type: Type.STRING, description: "The symbol or name of the coin/token detected in the chart, e.g., MONAD, ETH, BTC, SOL or NADP." },
      signal: { type: Type.STRING, description: "Recommended signal rating: BUY, SELL, or HOLD" },
      confidence: { type: Type.NUMBER, description: "Confidence decimal from 0.50 to 0.99 indicating accuracy level of the analysis." },
      pattern: { type: Type.STRING, description: "Specific technical pattern discovered in chart layout, e.g., Head and Shoulders, Double Bottom, Falling Wedge, Range Support Collapse." },
      price: { type: Type.NUMBER, description: "Current estimated token price based on the chart, or a reasonable fictional starting trading price." },
      targetPrice: { type: Type.NUMBER, description: "Recommended take-profit exit target based on standard technical analysis ratios." },
      stopLoss: { type: Type.NUMBER, description: "Recommended stop-loss protective price based on technical support levels." },
      timeframe: { type: Type.STRING, description: "Detected candle timeframe, e.g., 15M, 1H, 4H, 1D or 'Unknown' if not visible." },
      indicators: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Standard visual indicators parsed, e.g. ['RSI Bearish Divergence', 'MACD Cross', '200-EMA Squeeze']."
      },
      explanation: { type: Type.STRING, description: "A concise 2-sentence summary explaining this visual analysis and recommendation for traders on Monad." }
    },
    required: ["token", "signal", "confidence", "pattern", "price", "targetPrice", "stopLoss", "timeframe", "indicators", "explanation"]
  };

  const systemInstructions = `You are the master quantitative analyst and crypto visual pattern scanner for Xtreme Trade.
Analyze the uploaded cryptocurrency price movement chart with extreme visual detail.
Do not hallucinate coin names; if no token is visible, recommend MONAD or ETH as realistic selections.
Generate a valid, highly detailed trading signal (BUY, SELL, or HOLD), define the specific geometric pattern visible in the chart candles, and suggest realistic, technically defendable targets and stop-losses.
You are running on Monad Network, a super-fast EVM Layer 1 blockchain, so add context of high execution speeds if relevant in the explanation.`;

  try {
    if (ai) {
      console.log(`Running live Gemini chart analysis for: ${filename || "uploaded_chart"}`);
      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const textPart = {
        text: "Examine this trading chart image. Perform granular technical analysis. Identify the candlestick pattern or geometric formations, current price, suggest a BUY/SELL/HOLD signal, find indicators, choose a realistic coin ticker (e.g. MONAD, BTC, ETH) and calculate logical target/stop values. Respond with structured validation schema.",
      };

      // Call Gemini 3.5 Flash for multimodal visual recognition
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: systemInstructions,
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("Empty text output returned by Gemini model");
      }

      console.log("Raw Gemini analysis received:", textOutput);
      const parsedAnalysis = JSON.parse(textOutput.trim());

      // Generate a new TradeSignal to append to the active signals list
      const chars = "0123456789abcdef";
      let hash = "0x";
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * 16)];
      }

      const verifiedSignal = {
        id: "sig_gemini_" + Date.now().toString(36),
        token: String(parsedAnalysis.token || "MONAD").toUpperCase(),
        signal: (parsedAnalysis.signal === "SELL" ? "SELL" : parsedAnalysis.signal === "HOLD" ? "HOLD" : "BUY") as any,
        confidence: Number(parsedAnalysis.confidence) || 0.85,
        pattern: String(parsedAnalysis.pattern || "Candlestick Pattern Consolidation"),
        txHash: hash,
        timestamp: Date.now(),
        price: Number(parsedAnalysis.price) || 3.40,
        targetPrice: Number(parsedAnalysis.targetPrice) || 3.80,
        stopLoss: Number(parsedAnalysis.stopLoss) || 3.20,
        status: "ACTIVE" as const,
        result: "PENDING" as const,
        timeframes: String(parsedAnalysis.timeframe || "1H"),
        notes: `🤖 Live AI Analysis: ${String(parsedAnalysis.explanation || "Pattern verified with visual model prediction.")} Indicators parsed: ${(parsedAnalysis.indicators || []).join(", ")}.`
      };

      // We append it to the front of our global signals list
      signals.unshift(verifiedSignal);

      return res.json({
        status: "ok",
        analysis: parsedAnalysis,
        signal: verifiedSignal,
        mode: "live"
      });
    } else {
      // Fallback advanced simulation mode if GEMINI_API_KEY is not configured yet
      console.log("Using advanced simulation analyzer due to missing GEMINI_API_KEY");
      
      const simulatedTokens = ["MONAD", "ETH", "BTC", "CHOG", "NADP"];
      const token = simulatedTokens[Math.floor(Math.random() * simulatedTokens.length)];
      const rates = { MONAD: 3.42, ETH: 3452.10, BTC: 96840.0, CHOG: 0.14, NADP: 1.25 };
      const price = rates[token as keyof typeof rates] || 5.0;

      const signalsList = ["BUY", "SELL"] as const;
      const signal = signalsList[Math.floor(Math.random() * signalsList.length)];
      
      const simulatedPatterns = [
        { name: "Double Bottom Reversal", explanation: "Double bottom formation found near strong market support. High buy pressure expected." },
        { name: "Symmetrical Continuation Triangle", explanation: "Consolidation within narrowing wedge breakout. Momentum oscillators are flipping bullish." },
        { name: "Bearish Head & Shoulders Apex", explanation: "Crucial distribution peaks near local range highs, hinting at technical trend reversal." },
        { name: "Bullish Engulfing Cluster", explanation: "Strong volumetric engulfing candles indicating immediate trend resumption with defensive stops below local range lows." }
      ];
      const patternChoice = simulatedPatterns[Math.floor(Math.random() * simulatedPatterns.length)];
      
      const changePercent = 0.08;
      const targetPrice = signal === "BUY" ? +(price * (1 + changePercent)).toFixed(2) : +(price * (1 - changePercent)).toFixed(2);
      const stopLoss = signal === "BUY" ? +(price * (1 - changePercent / 2)).toFixed(2) : +(price * (1 + changePercent / 2)).toFixed(2);

      const chars = "0123456789abcdef";
      let hash = "0x";
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * 16)];
      }

      const mockAnalysisResult = {
        token,
        signal,
        confidence: +(0.80 + Math.random() * 0.18).toFixed(2),
        pattern: patternChoice.name,
        price,
        targetPrice,
        stopLoss,
        timeframe: "1H",
        indicators: ["RSI Oscillator (38.5)", "EMA 50/200 Support Squeeze", "Volume Profile Delta"],
        explanation: patternChoice.explanation
      };

      const mockSignal = {
        id: "sig_fallback_" + Date.now().toString(36),
        token: mockAnalysisResult.token,
        signal: mockAnalysisResult.signal,
        confidence: mockAnalysisResult.confidence,
        pattern: mockAnalysisResult.pattern,
        txHash: hash,
        timestamp: Date.now(),
        price: mockAnalysisResult.price,
        targetPrice: mockAnalysisResult.targetPrice,
        stopLoss: mockAnalysisResult.stopLoss,
        status: "ACTIVE" as const,
        result: "PENDING" as const,
        timeframes: mockAnalysisResult.timeframe,
        notes: `🔄 Demo Analysis Engine (No API Key Configured): ${mockAnalysisResult.explanation} Detected indicators: ${mockAnalysisResult.indicators.join(", ")}. Configure GEMINI_API_KEY inside the 'Settings > Secrets' panel in AI Studio to activate live model execution.`
      };

      signals.unshift(mockSignal);

      // Return a 200 containing this beautiful, functional mock payload
      return res.json({
        status: "ok",
        analysis: mockAnalysisResult,
        signal: mockSignal,
        mode: "simulation"
      });
    }
  } catch (error: any) {
    console.error("Error analyzing chart:", error);
    return res.status(500).json({
      error: "Failed to perform technical chart analysis via Gemini model",
      details: error.message || error
    });
  }
});


// STATIC ASSET SERVING & VITE INTEGRATION
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start full-stack web listener
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Xtreme Trade Web App successfully serving on http://localhost:${PORT}`);
});
