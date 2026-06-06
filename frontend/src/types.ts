export type SignalType = "BUY" | "SELL" | "HOLD";

export type SignalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type SignalResult = "PROFIT" | "LOSS" | "PENDING";

export interface TradeSignal {
  id: string;
  token: string;
  signal: SignalType;
  confidence: number;
  pattern: string;
  txHash: string;
  timestamp: number;
  price: number;
  targetPrice: number;
  stopLoss: number;
  status: SignalStatus;
  result: SignalResult;
  pnl?: number;
  timeframes?: string;
  notes?: string;
  allocatedAmount?: number;
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
  strategyScore?: number;
}

export interface SwapSuggestion {
  id: string;
  fromSignalId: string;
  fromToken: string;
  fromAmount: number;
  fromLossPercent: number;
  toToken: string;
  toOpportunityPattern: string;
  toExpectedGain: number;
  reason: string;
  associatedOpportunity?: ScannedOpportunity;
}

export interface StopLossAlert {
  id: string;
  signalId: string;
  token: string;
  currentPrice: number;
  stopLossPrice: number;
  suggestedOpportunityId: string | null;
  reason: string;
  timestamp: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface ContractInterfaceFunction {
  name: string;
  selector: string;
  params: string[];
}

export interface ContractInterface {
  id: string;
  name: string;
  address: string;
  abi: object[];
  functions: ContractInterfaceFunction[];
  tokens: string[];
  createdAt: number;
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
  investmentProfile: "CONSERVATIVE" | "BALANCED" | "RISKY";
  investmentPercentage: number;
  maxAvailablePositions: number;
  swapSuggestions: SwapSuggestion[];
  stopLossAlerts: StopLossAlert[];
}
