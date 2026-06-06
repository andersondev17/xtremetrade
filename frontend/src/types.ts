export type SignalType = "BUY" | "SELL" | "HOLD";

export type SignalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type SignalResult = "PROFIT" | "LOSS" | "PENDING";

export interface TradeSignal {
  id: string;
  token: string;
  signal: SignalType;
  confidence: number; // 0 to 1
  pattern: string;
  txHash: string;
  timestamp: number;
  price: number;
  targetPrice: number;
  stopLoss: number;
  status: SignalStatus;
  result: SignalResult;
  pnl?: number; // e.g. +4.5 or -1.2
  timeframes?: string; // e.g., "1H", "4H", "1D"
  notes?: string;
  allocatedAmount?: number; // Simulated capital allocation amount
}

export interface ChartAnalysisResult {
  token: string;
  signal: SignalType;
  confidence: number;
  pattern: string;
  price: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  indicators: string[];
  explanation: string;
}

export interface PerformanceStats {
  winRate: number;
  totalSignals: number;
  completedSignals: number;
  totalPnl: number;
  accuracyHistory: { date: string; rate: number }[];
  pnlHistory: { date: string; value: number }[];
}

export interface AgentLog {
  id: string;
  timestamp: number;
  type: "INFO" | "TRADE_OPEN" | "TRADE_CLOSE" | "RISK_ALERT" | "DECISION";
  message: string;
}

export interface ScannedOpportunity {
  id: string;
  token: string;
  signal: SignalType;
  confidence: number;
  pattern: string;
  price: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  reasoning: string;
  expectedPnl: number;
}

export interface AgentState {
  riskProfile: "CONSERVATIVE" | "INTERMEDIATE" | "RISKY";
  executionMode: "AUTOPILOT" | "ASSISTED";
  minCapitalLimit: number;
  currentBalance: number;
  startingBalance: number;
  isOperating: boolean;
  consecutiveLosses: number;
  opportunities: ScannedOpportunity[];
  logs: AgentLog[];
}
