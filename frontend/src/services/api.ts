import { TradeSignal, PerformanceStats, AgentState, ContractInterface } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "";

export interface CreateSignalInput {
  token: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  pattern: string;
  price: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  notes?: string;
}

export interface AnalyzeChartInput {
  imageBase64: string;
  filename: string;
}

export interface AnalyzeChartResponse {
  status: string;
  analysis: {
    token: string;
    signal: "BUY" | "SELL" | "HOLD";
    confidence: number;
    pattern: string;
    price: number;
    targetPrice: number;
    stopLoss: number;
    timeframe: string;
    indicators: string[];
    explanation: string;
  };
  signal: TradeSignal;
  mode: "live" | "simulation";
}

export class ApiService {
  static async fetchSignals(): Promise<TradeSignal[]> {
    const res = await fetch(`${API_BASE}/api/signals`);
    if (!res.ok) throw new Error(`Failed to fetch signals ledger (HTTP ${res.status})`);
    const data = await res.json();
    return data.signals || [];
  }

  static async fetchStats(): Promise<PerformanceStats> {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (!res.ok) throw new Error(`Failed to fetch system stats (HTTP ${res.status})`);
    const data = await res.json();
    return data.stats;
  }

  static async createSignal(signal: CreateSignalInput): Promise<TradeSignal> {
    const res = await fetch(`${API_BASE}/api/signals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signal),
    });
    if (!res.ok) throw new Error(`Failed to register custom signal (HTTP ${res.status})`);
    const data = await res.json();
    if (data.status !== "ok" || !data.signal) throw new Error(data.error || "Failed to commit custom signal");
    return data.signal;
  }

  static async analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartResponse> {
    const res = await fetch(`${API_BASE}/api/analyze-chart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const errData = await res.json();
        throw new Error((errData as any).error || "Technical visual analysis timeout");
      }
      throw new Error(`Analysis node returned active error (HTTP ${res.status})`);
    }
    return res.json();
  }

  static async fetchAgentState(): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/state`);
    if (!res.ok) throw new Error(`Failed to fetch autonomous agent state (HTTP ${res.status})`);
    const data = await res.json();
    return data.state;
  }

  static async configureAgent(params: {
    riskProfile?: "CONSERVATIVE" | "INTERMEDIATE" | "RISKY";
    executionMode?: "AUTOPILOT" | "ASSISTED";
    minCapitalLimit?: number;
    isOperating?: boolean;
    investmentProfile?: "CONSERVATIVE" | "BALANCED" | "RISKY";
  }): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Failed to configure autonomous agent (HTTP ${res.status})`);
    const data = await res.json();
    return data.state;
  }

  static async approveOpportunity(opportunityId: string): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/opportunity/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).error || `Failed to approve opportunity (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.state;
  }

  static async rejectOpportunity(opportunityId: string): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/opportunity/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });
    if (!res.ok) throw new Error(`Failed to dismiss opportunity (HTTP ${res.status})`);
    const data = await res.json();
    return data.state;
  }

  // Stop-loss alerts — id === alertId for compatibility with swap suggestion UI
  static async approveSwap(swapId: string): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/stop-loss-alerts/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId: swapId }),
    });
    if (!res.ok) throw new Error(`Failed to accept stop-loss alert (HTTP ${res.status})`);
    const data = await res.json();
    return data.state;
  }

  static async rejectSwap(swapId: string): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/stop-loss-alerts/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId: swapId }),
    });
    if (!res.ok) throw new Error(`Failed to reject stop-loss alert (HTTP ${res.status})`);
    const data = await res.json();
    return data.state;
  }

  static async closeSignalEarly(signalId: string): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/signal/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signalId }),
    });
    if (!res.ok) throw new Error(`Failed to close signal early (HTTP ${res.status})`);
    const data = await res.json();
    return data.state;
  }

  static async resetAgent(): Promise<AgentState> {
    const res = await fetch(`${API_BASE}/api/agent/reset`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to reset agent (HTTP ${res.status})`);
    const data = await res.json();
    return data.state;
  }

  // Contract Interfaces CRUD
  static async fetchContractInterfaces(): Promise<ContractInterface[]> {
    const res = await fetch(`${API_BASE}/api/contracts`);
    if (!res.ok) throw new Error(`Failed to fetch contract interfaces (HTTP ${res.status})`);
    const data = await res.json();
    return data.contracts || [];
  }

  static async createContractInterface(body: Omit<ContractInterface, "id" | "createdAt">): Promise<ContractInterface> {
    const res = await fetch(`${API_BASE}/api/contracts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to create contract interface (HTTP ${res.status})`);
    const data = await res.json();
    return data.contract;
  }

  static async updateContractInterface(id: string, body: Partial<Omit<ContractInterface, "id" | "createdAt">>): Promise<ContractInterface> {
    const res = await fetch(`${API_BASE}/api/contracts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to update contract interface (HTTP ${res.status})`);
    const data = await res.json();
    return data.contract;
  }

  static async deleteContractInterface(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/contracts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete contract interface (HTTP ${res.status})`);
  }
}
