import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AgentState, ScannedOpportunity, AgentLog, SwapSuggestion } from "../types";
import {
  Bot,
  Shield,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  ArrowUpRight,
  Info,
  ArrowRight,
  ShieldAlert,
  Settings2,
  Calendar,
  Check,
  Percent,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";

interface AgentPanelProps {
  agentState: AgentState;
  onConfigure: (params: {
    riskProfile?: "CONSERVATIVE" | "INTERMEDIATE" | "RISKY";
    executionMode?: "AUTOPILOT" | "ASSISTED";
    minCapitalLimit?: number;
    isOperating?: boolean;
    investmentProfile?: "CONSERVATIVE" | "BALANCED" | "RISKY";
  }) => void;
  onApproveOpportunity: (id: string) => void;
  onRejectOpportunity: (id: string) => void;
  onApproveSwap: (swapId: string) => void;
  onRejectSwap: (swapId: string) => void;
  onResetAgent: () => void;
  activeSignals: any[];
  onCloseSignalEarly: (id: string) => void;
}

export default function AgentPanel({
  agentState,
  onConfigure,
  onApproveOpportunity,
  onRejectOpportunity,
  onApproveSwap,
  onRejectSwap,
  onResetAgent,
  activeSignals,
  onCloseSignalEarly,
}: AgentPanelProps) {
  const [editingLimit, setEditingLimit] = useState(false);
  const [inputLimit, setInputLimit] = useState(agentState.minCapitalLimit.toString());

  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(inputLimit);
    if (!isNaN(val) && val >= 0) {
      onConfigure({ minCapitalLimit: val });
      setEditingLimit(false);
    }
  };

  const netEarnings = agentState.currentBalance - agentState.startingBalance;
  const growthPercent = (netEarnings / agentState.startingBalance) * 100;
  const activeAgentTrades = activeSignals.filter(s => s.id.startsWith("sig_agent_") && s.status === "ACTIVE");
  const allocatedCapitalTotal = activeAgentTrades.reduce((sum, s) => sum + (s.allocatedAmount || 0), 0);

  const riskOptions: { value: "CONSERVATIVE" | "INTERMEDIATE" | "RISKY"; label: string; lookback: string }[] = [
    { value: "CONSERVATIVE", label: "Conservador", lookback: "1 año" },
    { value: "INTERMEDIATE", label: "Intermedio", lookback: "6 meses" },
    { value: "RISKY", label: "Agresivo", lookback: "3 meses" },
  ];

  const invOptions: { value: "CONSERVATIVE" | "BALANCED" | "RISKY"; label: string; desc: string; pct: string }[] = [
    { value: "CONSERVATIVE", label: "Conservador", desc: "Todas las oportunidades", pct: "50%" },
    { value: "BALANCED", label: "Balanceado", desc: "Mejor mitad", pct: "75%" },
    { value: "RISKY", label: "Arriesgado", desc: "La mejor oportunidad", pct: "100%" },
  ];

  return (
    <div id="agent-panel-container" className="space-y-8 font-sans select-none">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/50 pb-5">
        <div>
          <h2 className="text-xl font-medium font-serif tracking-tight text-[#111827] flex items-center gap-2.5">
            <span className="p-1 px-1.5 rounded-lg bg-black text-white">
              <Bot className="w-5 h-5 text-[#4ADE80]" />
            </span>
            Autonomous AI Investment Agent
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Configure risk models, monitor automated scanner directives, and audit continuous agent executions on Monad L1.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onConfigure({ isOperating: !agentState.isOperating })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
              agentState.isOperating
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }`}
          >
            {agentState.isOperating ? (
              <><Pause className="w-3.5 h-3.5 fill-emerald-600 stroke-none" /><span>Agent Status: LIVE</span></>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-amber-600 stroke-none" /><span>Agent Status: PAUSED</span></>
            )}
          </button>

          <button
            onClick={onResetAgent}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-black transition-all cursor-pointer"
            title="Reset Agent Portfolio Balance"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* THREE-COLUMN STATS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio Capital */}
        <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-[0.04] text-black shrink-0 pointer-events-none group-hover:scale-105 transition-transform duration-500">
            <DollarSign className="w-32 h-32" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] uppercase font-semibold">Simulated Portfolio Capital</span>
            <div className="text-3xl font-bold font-mono tracking-tight text-[#111827] mt-2 select-text">
              {agentState.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs text-gray-400 font-sans font-medium ml-1.5 uppercase">MONAD</span>
            </div>
            <div className="flex items-center gap-1 text-xs mt-1 font-sans">
              <span className={netEarnings >= 0 ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}>
                {netEarnings >= 0 ? "+" : ""}{growthPercent.toFixed(2)}%
              </span>
              <span className="text-gray-400">gains since initialization ($10,000)</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Allocated in Position</span>
            <span className="text-gray-900 font-bold font-mono">${allocatedCapitalTotal.toLocaleString()} MONAD</span>
          </div>
        </div>

        {/* Capital Protection */}
        <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] uppercase font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Capital Protection Safety
            </span>
            <div className="mt-3.5">
              {editingLimit ? (
                <form onSubmit={handleLimitSubmit} className="flex gap-2">
                  <input
                    type="number"
                    value={inputLimit}
                    onChange={(e) => setInputLimit(e.target.value)}
                    className="bg-gray-50 border border-gray-250 rounded-xl px-2.5 py-1.5 text-xs text-[#1F2937] focus:outline-none focus:border-black w-28 font-mono font-bold"
                    autoFocus
                  />
                  <button type="submit" className="text-[10px] font-mono uppercase bg-black text-white px-2.5 py-1 rounded-xl cursor-pointer">Save</button>
                  <button type="button" onClick={() => setEditingLimit(false)} className="text-[10px] font-mono text-gray-400 hover:text-black cursor-pointer">Cancel</button>
                </form>
              ) : (
                <div
                  onClick={() => { setInputLimit(agentState.minCapitalLimit.toString()); setEditingLimit(true); }}
                  className="text-2xl font-bold font-mono tracking-tight text-[#111827] flex items-baseline gap-1.5 cursor-pointer hover:opacity-85"
                >
                  ${agentState.minCapitalLimit.toLocaleString()}
                  <span className="text-[10px] text-gray-400 uppercase font-sans font-medium">MONAD Trigger</span>
                </div>
              )}
              <p className="text-[#6B7280] text-[11px] mt-1.5">
                The absolute net limit. Agent blocks all trade execution if equity descends to this trigger.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center text-[9px] mb-1.5 font-mono uppercase tracking-wider text-gray-400 font-semibold">
              <span>equity safety buffer</span>
              <span className="font-bold">{Math.max(0, Math.round(((agentState.currentBalance - agentState.minCapitalLimit) / agentState.currentBalance) * 100))}% safe</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, ((agentState.currentBalance - agentState.minCapitalLimit) / agentState.currentBalance) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Stop-Loss Rule */}
        <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] uppercase font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Dynamic Stop-Loss Security Rule
            </span>
            <div className="mt-2.5">
              <span className="text-xs font-serif italic text-[#1F2937] font-semibold block leading-relaxed">
                Rule: "Never trigger autonomous stop losses directly."
              </span>
              <p className="text-[#4B5563] text-[11px] mt-1.5 leading-relaxed font-sans">
                Positions hitting a negative threshold are frozen. The agent generates real-time <strong>Asset Swap Suggestions</strong> to reallocate capital into highly profitable strategies.
              </p>
            </div>
          </div>
          <div className="mt-4 text-[10px] font-mono text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-150 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Active Swaps in Queue: {agentState.swapSuggestions?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* PROFILE SELECTORS — Risk Strategy + Investment Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Profile (strategy lookback) */}
        <div className="p-5 rounded-3xl border border-gray-200 bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] uppercase font-semibold">Strategy Risk Profile</span>
              <p className="text-[11px] text-gray-500">Determines historical price lookback period for opportunity evaluation.</p>
            </div>
          </div>
          <div className="flex gap-2">
            {riskOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onConfigure({ riskProfile: opt.value })}
                className={`flex-1 py-2.5 px-2 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  agentState.riskProfile === opt.value
                    ? "bg-black text-white border-black shadow"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[8px] tracking-wide font-normal ${agentState.riskProfile === opt.value ? "text-gray-300" : "text-gray-400"}`}>
                  {opt.lookback}
                </span>
              </button>
            ))}
          </div>
          <div className="text-[9.5px] font-mono text-gray-500 bg-zinc-50 border border-gray-200/50 rounded-xl p-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 text-black shrink-0" />
            <span>
              Evaluando pico-a-valle en <strong>{agentState.riskProfile === "CONSERVATIVE" ? "1 año" : agentState.riskProfile === "INTERMEDIATE" ? "6 meses" : "3 meses"}</strong> para calcular price_position_score.
            </span>
          </div>
        </div>

        {/* Investment Profile (capital allocation) */}
        <div className="p-5 rounded-3xl border border-gray-200 bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] uppercase font-semibold">Investment Profile</span>
              <p className="text-[11px] text-gray-500">Determines capital allocation and position selection strategy.</p>
            </div>
          </div>
          <div className="flex gap-2">
            {invOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onConfigure({ investmentProfile: opt.value })}
                className={`flex-1 py-2.5 px-2 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  agentState.investmentProfile === opt.value
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[8px] tracking-wide font-normal ${agentState.investmentProfile === opt.value ? "text-emerald-100" : "text-gray-400"}`}>
                  {opt.pct}
                </span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-gray-500">
            <div className="bg-gray-50 rounded-lg p-1.5 text-center">
              <div className="font-bold text-gray-700">50%</div>
              <div>todas las opps</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-1.5 text-center">
              <div className="font-bold text-gray-700">75%</div>
              <div>mejor mitad</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-1.5 text-center">
              <div className="font-bold text-gray-700">100%</div>
              <div>la top opp</div>
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTION MODE */}
      <div className="p-5 rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] uppercase font-semibold">Execution Mode</span>
              <p className="text-[11px] text-gray-500">AUTOPILOT executes investment batch automatically. ASSISTED requires manual approval per opportunity.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {(["ASSISTED", "AUTOPILOT"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onConfigure({ executionMode: mode })}
                className={`px-4 py-2 rounded-xl border font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                  agentState.executionMode === mode
                    ? mode === "AUTOPILOT"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow"
                      : "bg-black text-white border-black shadow"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STOP-LOSS SWAP SUGGESTIONS */}
      {agentState.swapSuggestions && agentState.swapSuggestions.length > 0 && (
        <div className="p-6 rounded-3xl border border-amber-200 bg-amber-50/20 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold font-sans tracking-widest text-amber-950 uppercase">
                  Stop-Loss Alerts — Agent Reallocation Suggestions
                </h3>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Autonomous stop-loss is deactivated. Accept to close position at current price, or reject to keep holding.
                </p>
              </div>
            </div>
            <div className="text-[10px] font-mono bg-amber-150 text-amber-900 font-bold px-2.5 py-1 rounded-xl w-fit">
              {agentState.swapSuggestions.length} Alert(s)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {agentState.swapSuggestions.map((swap) => (
                <motion.div
                  key={swap.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-1 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100">{swap.fromToken}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">{swap.toToken}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-500">Loss: -{swap.fromLossPercent}%</span>
                    </div>
                    <div className="text-gray-700 text-[11px] leading-relaxed"><strong>Reallocation Advice:</strong> {swap.reason}</div>
                    <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] uppercase text-[#9CA3AF] block tracking-wider font-semibold">Locked Capital</span>
                        <span className="font-bold text-gray-800">${swap.fromAmount.toLocaleString()} MONAD</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-emerald-600 block tracking-wider font-bold">Expected Yield</span>
                        <span className="font-bold text-emerald-600">+{swap.toExpectedGain}% Return</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-end gap-2 shrink-0">
                    <button
                      onClick={() => onRejectSwap(swap.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:text-black text-gray-450 text-[10px] font-bold font-mono uppercase tracking-wider transition-all hover:bg-gray-50 cursor-pointer"
                    >
                      Keep Holding
                    </button>
                    <button
                      onClick={() => onApproveSwap(swap.id)}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-200"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                      Accept — Sell Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* OPPORTUNITIES TRAY */}
      <div className="space-y-4">
        <div className="border-b border-gray-200/50 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-905 font-serif flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Scanned Liquidity Pool Opportunities Tray
            </h3>
            <p className="text-[11px] text-gray-400">Found tokens with high validation matching score on de-centralized nodes.</p>
          </div>
          <div className="text-[10px] font-mono text-gray-400">Tray matches: {agentState.opportunities.length} total</div>
        </div>

        {agentState.opportunities.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-white">
            <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2.5 animate-bounce" />
            <p className="text-xs font-serif font-medium text-gray-905 italic">Scanning pools for viable targets...</p>
            <p className="text-[9px] uppercase font-mono tracking-widest text-[#9CA3AF] mt-1.5 max-w-sm mx-auto leading-relaxed">
              The agent is actively scanning Monad liquidity nodes. Target opportunities populate automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {agentState.opportunities.map((opp) => (
                <motion.div
                  key={opp.id}
                  layoutId={`opp-card-${opp.id}`}
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="p-5 bg-white border border-gray-200 rounded-3xl relative overflow-hidden shadow-sm flex flex-col justify-between group hover:border-gray-400 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-xs">{opp.token}</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs font-sans text-gray-900">{opp.token}/USDC</span>
                            <span className="text-[8px] font-mono uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200/40">{opp.timeframe} frame</span>
                          </div>
                          <p className="text-[10px] text-gray-450 font-mono flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500" />
                            {opp.pattern}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono font-bold text-emerald-600">+{opp.expectedPnl}% PnL Target</span>
                        <span className="text-[9px] text-gray-400 font-mono">confidence: {Math.round(opp.confidence * 100)}%</span>
                        {opp.strategyScore !== undefined && opp.strategyScore !== opp.confidence && (
                          <span className="text-[9px] text-indigo-500 font-mono">score: {(opp.strategyScore * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#6B7280] italic leading-relaxed bg-gray-50/50 p-2.5 rounded-xl border border-gray-150 mt-4 font-sans">
                      {opp.reasoning}
                    </p>

                    <div className="text-[9.5px] font-mono text-gray-500 mt-3 p-2 bg-zinc-50 border border-gray-200/50 rounded-xl flex items-center gap-1.5 leading-snug select-text">
                      <Calendar className="w-3.5 text-black shrink-0" />
                      <span>Evaluation Profile ({agentState.riskProfile}): Analyzing {agentState.riskProfile === "CONSERVATIVE" ? "1 year" : agentState.riskProfile === "INTERMEDIATE" ? "6 months" : "3 months"} of price history.</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 text-center text-[11px] mt-3 font-mono">
                      <div className="bg-gray-50/50 p-2 rounded-xl">
                        <span className="text-[8px] uppercase text-gray-400 tracking-wider">Entry</span>
                        <div className="font-bold text-gray-800">${opp.price}</div>
                      </div>
                      <div className="bg-gray-50/50 p-2 rounded-xl">
                        <span className="text-[8px] uppercase text-gray-400 tracking-wider">Target exit</span>
                        <div className="font-bold text-emerald-600">${opp.targetPrice}</div>
                      </div>
                      <div className="bg-gray-50/50 p-2 rounded-xl">
                        <span className="text-[8px] uppercase text-gray-400 tracking-wider">Stop loss</span>
                        <div className="font-bold text-rose-500">${opp.stopLoss}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3.5 mt-4 flex items-center justify-end gap-2">
                    {agentState.executionMode === "AUTOPILOT" ? (
                      <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1 animate-pulse border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5 fill-emerald-100 stroke-emerald-600" />
                        Autopilot handling execution
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onRejectOpportunity(opp.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-black hover:bg-gray-50 text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer bg-white"
                        >
                          Dismiss Target
                        </button>
                        <button
                          onClick={() => onApproveOpportunity(opp.id)}
                          className="px-4 py-1.5 rounded-xl bg-black hover:bg-black/90 text-white text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#4ADE80]" />
                          Approve & Execute Position
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ACTIVE POSITIONS & AUDIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 font-sans">

        {/* Active Managed Positions */}
        <div className="space-y-4">
          <div className="border-b border-gray-200/50 pb-3">
            <h3 className="text-sm font-semibold tracking-wide text-[#111827] font-serif">
              Active Managed Agent Positions ({activeAgentTrades.length})
            </h3>
            <p className="text-[11px] text-[#4B5563]">
              Direct portfolio positions supervised with real-time Take-Profit / Stop-Loss.
            </p>
          </div>

          {activeAgentTrades.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-white text-gray-450">
              <Shield className="w-7 h-7 text-gray-200 mx-auto mb-2" />
              <p className="text-xs font-serif font-medium text-gray-905 italic">No active positions open</p>
              <p className="text-[9px] uppercase font-mono tracking-widest text-[#9CA3AF] mt-1">Approve scanned candidates above to launch position safety tracking.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activeAgentTrades.map((trade) => {
                const extremelyConfis = trade.confidence > 0.95;
                return (
                  <div
                    key={trade.id}
                    className="p-4 bg-white border border-gray-200 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-black transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{trade.token}/USDC</span>
                          <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">{trade.signal}</span>
                          {extremelyConfis && (
                            <span className="text-[7.5px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded tracking-wide uppercase animate-pulse font-bold">
                              High Conviction (&gt;95% Target +15%)
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#4B5563] font-mono mt-1">
                          Allocation: <span className="text-[#111827] font-bold">${trade.allocatedAmount?.toLocaleString()} MONAD</span>
                        </p>
                      </div>
                      <button
                        onClick={() => onCloseSignalEarly(trade.id)}
                        className="px-2.5 py-1 rounded-xl text-[9px] font-bold font-mono uppercase bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition-colors cursor-pointer select-none"
                      >
                        Exit trade early
                      </button>
                    </div>

                    {extremelyConfis ? (
                      <div className="my-2 bg-indigo-50/50 p-2.5 rounded-xl text-[9.5px] text-indigo-950 font-sans leading-relaxed border border-indigo-100/50 mb-0">
                        <strong>Autonomic Take-Profit Delayed Hold Decision:</strong> Confidence exceeded 95% ({Math.round(trade.confidence * 100)}%). Extended target of +15% active instead of standard 10% TP.
                      </div>
                    ) : (
                      <div className="my-1.5 text-[9px] font-mono text-emerald-600 font-semibold">
                        ✓ Standard 10% Take Profit active autonomously.
                      </div>
                    )}

                    <div className="mt-3.5 pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-gray-400">Exit Target: <span className="text-emerald-700 font-bold">${trade.targetPrice}</span></span>
                      <span className="text-amber-600 font-bold">Auto-SL Blocked (Swap suggestion active)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div className="space-y-4">
          <div className="border-b border-gray-200/50 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-gray-905 font-serif">Full Operations Audit Ledger (Trace)</h3>
              <p className="text-[11px] text-[#4B5563]">Cryptographic log of calculations, risk evaluations, and trade actions.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#10b981] bg-[#DCFCE7] px-2 py-0.5 rounded border border-emerald-100 shrink-0 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE STREAM
            </div>
          </div>

          <div className="bg-gray-900 text-gray-100 p-5 rounded-3xl font-mono text-[11px] h-[350px] overflow-y-auto leading-relaxed border border-black scrollbar-thin scrollbar-thumb-gray-800">
            {agentState.logs.length === 0 ? (
              <div className="text-center text-[#9CA3AF] py-12 flex flex-col items-center justify-center h-full">
                <Clock className="w-5 h-5 text-gray-600 animate-spin mb-2" />
                Generating system logs stream...
              </div>
            ) : (
              <div className="space-y-3.5">
                <AnimatePresence mode="popLayout">
                  {agentState.logs.map((log) => {
                    let typeColor = "text-blue-400";
                    let prefix = "[INFO]";
                    if (log.type === "DECISION") { typeColor = "text-amber-450 font-bold"; prefix = "[DECISION]"; }
                    else if (log.type === "TRADE_OPEN") { typeColor = "text-emerald-405 font-bold"; prefix = "[ORDER_OPEN]"; }
                    else if (log.type === "TRADE_CLOSE") { typeColor = "text-indigo-400 font-bold"; prefix = "[ORDER_CLOSE]"; }
                    else if (log.type === "RISK_ALERT") { typeColor = "text-rose-450 font-extrabold"; prefix = "[RISK_WARNING]"; }
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-start gap-2.5 pb-2 border-b border-gray-800/20 last:border-b-0 select-text"
                      >
                        <span className="text-gray-500 shrink-0 select-none">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                        <span className={`${typeColor} shrink-0 select-none`}>{prefix}</span>
                        <span className="text-gray-300 break-words">{log.message}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
