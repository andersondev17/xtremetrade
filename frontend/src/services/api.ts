import { TradeSignal, PerformanceStats, AgentState } from "../types";

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

/**
 * TECHNICAL INFRASTRUCTURE LAYER
 * Decouples raw HTTP network layers from React components. Handles response type
 * guards and returns consistent domain structures.
 */
export class ApiService {
  /**
   * Fetches active and closed trading signals
   */
  static async fetchSignals(): Promise<TradeSignal[]> {
    const res = await fetch("/api/signals");
    if (!res.ok) {
      throw new Error(`Failed to fetch signals ledger (HTTP ${res.status})`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Invalid response content-type: expected application/json");
    }
    const data = await res.json();
    return data.signals || [];
  }

  /**
   * Fetches performance and win rate statistics
   */
  static async fetchStats(): Promise<PerformanceStats> {
    const res = await fetch("/api/stats");
    if (!res.ok) {
      throw new Error(`Failed to fetch system stats (HTTP ${res.status})`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Invalid response content-type: expected application/json");
    }
    const data = await res.json();
    return data.stats;
  }

  /**
   * Submits a custom manually mapped operator signal
   */
  static async createSignal(signal: CreateSignalInput): Promise<TradeSignal> {
    const res = await fetch("/api/signals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signal),
    });
    if (!res.ok) {
      throw new Error(`Failed to register custom signal (HTTP ${res.status})`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Invalid response content-type: expected application/json");
    }
    const data = await res.json();
    if (data.status !== "ok" || !data.signal) {
      throw new Error(data.error || "Failed to commit custom signal");
    }
    return data.signal;
  }

  /**
   * Sends base64 chart captures to Gemini for multimodal vision scanning
   */
  static async analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartResponse> {
    const res = await fetch("/api/analyze-chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errData = await res.json();
        throw new Error(errData.error || "Technical visual analysis timeout");
      }
      throw new Error(`Analysis node returned active error (HTTP ${res.status})`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Invalid vision response channel formatting. Resynced logs are active.");
    }
    return res.json();
  }

  /**
   * Fetches the current autonomous agent state.
   */
  static async fetchAgentState(): Promise<AgentState> {
    const res = await fetch("/api/agent/state");
    if (!res.ok) {
      throw new Error(`Failed to fetch autonomous agent state (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.state;
  }

  /**
   * Configures parameters on the autonomous agent.
   */
  static async configureAgent(params: {
    riskProfile?: "CONSERVATIVE" | "INTERMEDIATE" | "RISKY";
    executionMode?: "AUTOPILOT" | "ASSISTED";
    minCapitalLimit?: number;
    isOperating?: boolean;
  }): Promise<AgentState> {
    const res = await fetch("/api/agent/configure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Failed to configure autonomous agent (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.state;
  }

  /**
   * Manually approves a scanned opportunity to open a position.
   */
  static async approveOpportunity(opportunityId: string): Promise<AgentState> {
    const res = await fetch("/api/agent/opportunity/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opportunityId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to approve opportunity (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.state;
  }

  /**
   * Dismisses/Rejects a scanned opportunity.
   */
  static async rejectOpportunity(opportunityId: string): Promise<AgentState> {
    const res = await fetch("/api/agent/opportunity/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opportunityId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to dismiss opportunity (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.state;
  }

  /**
   * Closes an active signal early manually.
   */
  static async closeSignalEarly(signalId: string): Promise<AgentState> {
    const res = await fetch("/api/agent/signal/close", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signalId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to close signal early (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.state;
  }

  /**
   * Resets the agent capital, logs, and opportunities.
   */
  static async resetAgent(): Promise<AgentState> {
    const res = await fetch("/api/agent/reset", {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error(`Failed to reset agent (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.state;
  }
}
