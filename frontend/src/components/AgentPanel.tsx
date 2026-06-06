import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AgentState, ScannedOpportunity, AgentLog } from "../types";
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
  Info
} from "lucide-react";

interface AgentPanelProps {
  agentState: AgentState;
  onConfigure: (params: {
    riskProfile?: "CONSERVATIVE" | "INTERMEDIATE" | "RISKY";
    executionMode?: "AUTOPILOT" | "ASSISTED";
    minCapitalLimit?: number;
    isOperating?: boolean;
  }) => void;
  onApproveOpportunity: (id: string) => void;
  onRejectOpportunity: (id: string) => void;
  onResetAgent: () => void;
  activeSignals: any[];
  onCloseSignalEarly: (id: string) => void;
}

export default function AgentPanel({
  agentState,
  onConfigure,
  onApproveOpportunity,
  onRejectOpportunity,
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

  // Calculate profit pnl metrics
  const netEarnings = agentState.currentBalance - agentState.startingBalance;
  const growthPercent = (netEarnings / agentState.startingBalance) * 100;

  // Active trades allocated amount total
  const activeAgentTrades = activeSignals.filter(s => s.id.startsWith("sig_agent_") && s.status === "ACTIVE");
  const allocatedCapitalTotal = activeAgentTrades.reduce((sum, s) => sum + (s.allocatedAmount || 0), 0);

  return (
    <div id="agent-panel-container" className="space-y-8 font-sans select-none">
      
      {/* HEADER SECTION */}
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
              <>
                <Pause className="w-3.5 h-3.5 fill-emerald-600 stroke-none" />
                <span>Agent Status: LIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-amber-600 stroke-none" />
                <span>Agent Status: PAUSED</span>
              </>
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

      {/* THREE-COLUMN STATS BENTO SECT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* balance metrics */}
        <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-[0.04] text-black shrink-0 pointer-events-none group-hover:scale-105 transition-transform duration-500">
            <DollarSign className="w-32 h-32" />
          </div>

          <div>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-semibold">Simulated Portfolio Capital</span>
            <div className="text-3xl font-bold font-mono tracking-tight text-[#111827] mt-2 select-text">
              {agentState.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs text-gray-400 font-sans font-medium ml-1.5 uppercase">MONAD</span>
            </div>
            <div className="flex items-center gap-1 text-xs mt-1 font-sans">
              <span className={netEarnings >= 0 ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}>
                {netEarnings >= 0 ? "+" : ""}
                {growthPercent.toFixed(2)}%
              </span>
              <span className="text-gray-400">gains since initialization ($10,000)</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Allocated in Position</span>
            <span className="text-gray-900 font-bold font-mono">${allocatedCapitalTotal.toLocaleString()} MONAD</span>
          </div>
        </div>

        {/* risk controls & safety threshold */}
        <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-semibold flex items-center gap-1.5">
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
                  <button type="submit" className="text-[10px] font-mono uppercase bg-black text-white px-2.5 py-1 rounded-xl cursor-pointer">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingLimit(false)} className="text-[10px] font-mono text-gray-400 hover:text-black cursor-pointer">
                    Cancel
                  </button>
                </form>
              ) : (
                <div 
                  onClick={() => {
                    setInputLimit(agentState.minCapitalLimit.toString());
                    setEditingLimit(true);
                  }}
                  className="text-2xl font-bold font-mono tracking-tight text-[#111827] flex items-baseline gap-1.5 cursor-pointer hover:opacity-85"
                >
                  ${agentState.minCapitalLimit.toLocaleString()}
                  <span className="text-[10px] text-gray-400 uppercase font-sans font-medium">MONAD Trigger</span>
                </div>
              )}
              <p className="text-[#6B7280] text-[11px] mt-1.5">
                The absolute net limit. The agent is forced to block all trade execution if equity descends toward this trigger.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center text-[9px] mb-1.5 font-mono uppercase tracking-wider text-gray-400">
              <span>equity safety buffer</span>
              <span className="text-gray-900 font-bold">
                {Math.max(0, Math.round(((agentState.currentBalance - agentState.minCapitalLimit) / agentState.currentBalance) * 100))}% safe
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, ((agentState.currentBalance - agentState.minCapitalLimit) / agentState.currentBalance) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* sequence risk mitigation tracker */}
        <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-semibold">Sequence Risk Mitigation</span>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#111827] mt-3.5 flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${agentState.consecutiveLosses > 0 ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
              {agentState.consecutiveLosses} Losses
            </div>
            <p className="text-[#6B7280] text-[11px] mt-2">
              Anti-loss controls automatically throttle operational risks downward on 3 consecutive failures to safeguard system trust.
            </p>
          </div>

          <div className="mt-4 text-[10px] font-mono text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-150 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>Throttled Mode: {agentState.consecutiveLosses >= 3 ? "ACTIVATED (CONSERVATIVE MODE)" : "NORMAL OPERATIVE"}</span>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR LAYOUT */}
      <div className="p-5 rounded-2xl border border-gray-200/50 bg-white flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
        {/* risk selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-black" />
            Active Risk Profile Parameter:
          </span>

          <div className="flex bg-gray-50 p-1 border border-gray-200/60 rounded-xl max-w-full overflow-x-auto">
            {(["CONSERVATIVE", "INTERMEDIATE", "RISKY"] as const).map((profile) => (
              <button
                key={profile}
                onClick={() => onConfigure({ riskProfile: profile })}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider transition-all uppercase whitespace-nowrap cursor-pointer ${
                  agentState.riskProfile === profile
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-400 hover:text-black hover:bg-gray-100"
                }`}
              >
                {profile === "CONSERVATIVE" ? "Conservador" : profile === "INTERMEDIATE" ? "Intermedio" : "Arriesgado"}
              </button>
            ))}
          </div>
        </div>

        {/* execution mode toggles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto md:justify-end">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
            OPERATIONAL MODE:
          </span>

          <div className="flex bg-gray-50 p-1 border border-gray-200/60 rounded-xl w-full sm:w-auto">
            {(["ASSISTED", "AUTOPILOT"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onConfigure({ executionMode: mode })}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                  agentState.executionMode === mode
                    ? mode === "AUTOPILOT"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-black text-white shadow-sm"
                    : "text-gray-400 hover:text-black hover:bg-gray-100"
                }`}
              >
                {mode === "ASSISTED" ? "Supervisory (Assisted)" : "Autopilot (Automated)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ACTIONS & OPPORTUNITIES FEED */}
        <div className="xl:col-span-12 space-y-4">
          <div className="border-b border-gray-200/50 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-gray-900 font-serif flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Scanned Liquidity Pool Opportunities Tray
              </h3>
              <p className="text-[11px] text-gray-400">
                Found tokens with high validation matching score on de-centralized nodes.
              </p>
            </div>

            <div className="text-[10px] font-mono text-gray-400">
              Tray matches: {agentState.opportunities.length} total
            </div>
          </div>

          {agentState.opportunities.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-white">
              <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2.5 animate-bounce" />
              <p className="text-xs font-serif font-medium text-gray-900 italic">Scanning pools for viable targets...</p>
              <p className="text-[9px] uppercase font-mono tracking-widest text-[#9CA3AF] mt-1.5 max-w-sm mx-auto leading-relaxed">
                The agent is actively scanning Monad liquidity nodes. Target opportunities populate automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {agentState.opportunities.map((opp) => {
                  let riskTagColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                  if (opp.confidence < 0.88) riskTagColor = "text-amber-700 bg-amber-50 border-amber-100";
                  return (
                    <motion.div
                      key={opp.id}
                      layoutId={`opp-card-${opp.id}`}
                      initial={{ opacity: 0, scale: 0.98, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="p-5 bg-white border border-gray-200 rounded-3xl relative overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* Upper row header */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-xs">
                              {opp.token}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs font-sans text-gray-900">{opp.token}/USDC</span>
                                <span className="text-[8px] font-mono uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200/40">
                                  {opp.timeframe} frame
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500" />
                                {opp.pattern}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono font-bold text-emerald-600">+{opp.expectedPnl}% PnL Target</span>
                            <span className="text-[9px] text-gray-400 font-mono">confidence: {Math.round(opp.confidence * 100)}%</span>
                          </div>
                        </div>

                        {/* Mid Row content */}
                        <p className="text-[11px] text-[#6B7280] italic leading-relaxed bg-gray-50/50 p-2.5 rounded-xl border border-gray-150 mt-4">
                          {opp.reasoning}
                        </p>

                        {/* Metrics specs table */}
                        <div className="grid grid-cols-3 gap-2 py-1 text-center text-[11px] mt-4 font-mono">
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

                      {/* Lower row manual approval trigger action buttons selection */}
                      <div className="border-t border-gray-100 pt-3.5 mt-4 flex items-center justify-end gap-2">
                        {agentState.executionMode === "AUTOPILOT" ? (
                          <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1 animate-pulse">
                            <CheckCircle className="w-3.5 h-3.5 fill-emerald-100 stroke-emerald-600" />
                            Autopilot handling execution
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onRejectOpportunity(opp.id)}
                              className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-black hover:bg-gray-50 text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Dismiss Target
                            </button>
                            <button
                              onClick={() => {
                                onApproveOpportunity(opp.id);
                              }}
                              className="px-4 py-1.5 rounded-xl bg-black hover:bg-black/90 text-white text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#4ADE80]" />
                              Approve & Execute Position
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ACTIVE AGENT POSITIONS & AUDIT LOGS */}
        <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          
          {/* ACTIVE POSITIONS MANAGED BY AGENT */}
          <div className="space-y-4">
            <div className="border-b border-gray-200/50 pb-3">
              <h3 className="text-sm font-semibold tracking-wide text-gray-900 font-serif">
                Active Managed Agent Positions ({activeAgentTrades.length})
              </h3>
              <p className="text-[11px] text-gray-400">
                Direct portfolio positions supervised with real-time Take-Profit / Stop-Loss.
              </p>
            </div>

            {activeAgentTrades.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-white text-gray-400">
                <Shield className="w-7 h-7 text-gray-250 mx-auto mb-2" />
                <p className="text-xs font-serif font-medium text-gray-900 italic">No active positions open</p>
                <p className="text-[9px] uppercase font-mono tracking-widest text-[#9CA3AF] mt-1">
                  Approve scanned candidates above to launch position safety tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeAgentTrades.map((trade) => {
                  const percentOfPortfolio = ((trade.allocatedAmount || 0) / agentState.currentBalance) * 100;
                  return (
                    <div 
                      key={trade.id} 
                      className="p-4 bg-white border border-gray-200 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-gray-250 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{trade.token}/USDC</span>
                            <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                              {trade.signal}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono mt-1">
                            Allocated: <span className="text-gray-900 font-bold">${trade.allocatedAmount?.toLocaleString()} MONAD</span> 
                          </p>
                        </div>

                        <button 
                          onClick={() => onCloseSignalEarly(trade.id)}
                          className="px-2.5 py-1 rounded-xl text-[9px] font-bold font-mono uppercase bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition-colors cursor-pointer select-none"
                          title="Force immediate sell-off return to capital pool"
                        >
                          Exit Trade early
                        </button>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-gray-50 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-gray-400">Exit Target: <span className="text-emerald-600 font-bold">${trade.targetPrice}</span></span>
                        <span className="text-gray-400">Buffer Stop: <span className="text-rose-500 font-bold">${trade.stopLoss}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* REAL TIME AUDIT TRAILS */}
          <div className="space-y-4">
            <div className="border-b border-gray-200/50 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-gray-900 font-serif">
                  Full Operations Audit Ledger (Trace)
                </h3>
                <p className="text-[11px] text-gray-400">
                  Cryptographic log of calculations, risk evaluations, and trade actions.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#10b981] bg-[#DCFCE7] px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE STREAM
              </div>
            </div>

            <div className="bg-gray-900 text-gray-100 p-5 rounded-3xl font-mono text-[11px] h-[350px] overflow-y-auto leading-relaxed border border-black scrollbar-thin">
              {agentState.logs.length === 0 ? (
                <div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center h-full">
                  <Clock className="w-5 h-5 text-gray-600 animate-spin mb-2" />
                  Generating system logs stream...
                </div>
              ) : (
                <div className="space-y-3.5">
                  <AnimatePresence mode="popLayout">
                    {agentState.logs.map((log) => {
                      let typeColor = "text-blue-400";
                      let prefix = "[INFO]";
                      if (log.type === "DECISION") {
                        typeColor = "text-amber-400";
                        prefix = "[LOGIC]";
                      } else if (log.type === "TRADE_OPEN") {
                        typeColor = "text-emerald-400";
                        prefix = "[ORDER]";
                      } else if (log.type === "TRADE_CLOSE") {
                        typeColor = "text-[#818CF8]";
                        prefix = "[EXIT]";
                      } else if (log.type === "RISK_ALERT") {
                        typeColor = "text-rose-450 font-bold";
                        prefix = "[CRITICAL_STOP]";
                      }

                      return (
                        <motion.div 
                          key={log.id} 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-start gap-2.5 pb-2 border-b border-gray-800/20 last:border-b-0 select-text"
                        >
                          <span className="text-gray-500 shrink-0 select-none">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                          </span>
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

    </div>
  );
}
