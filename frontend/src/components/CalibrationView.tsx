import React, { useState } from "react";
import { AgentState } from "../types";
import {
  Sliders,
  Shield,
  Percent,
  TrendingUp,
  RotateCcw,
  Calendar,
  Settings2,
  DollarSign,
  AlertOctagon,
  Wrench,
  Activity,
  Cpu
} from "lucide-react";
import { motion } from "motion/react";

interface CalibrationViewProps {
  agentState: AgentState;
  onConfigure: (params: {
    riskProfile?: "CONSERVATIVE" | "INTERMEDIATE" | "RISKY";
    executionMode?: "AUTOPILOT" | "ASSISTED";
    minCapitalLimit?: number;
    isOperating?: boolean;
    investmentProfile?: "CONSERVATIVE" | "BALANCED" | "RISKY";
    investmentPercentage?: number;
    maxAvailablePositions?: number;
  }) => void;
  onResetAgent: () => void;
}

export default function CalibrationView({
  agentState,
  onConfigure,
  onResetAgent
}: CalibrationViewProps) {
  const [editingLimit, setEditingLimit] = useState(false);
  const [inputLimit, setInputLimit] = useState(agentState.minCapitalLimit.toString());
  const [customPct, setCustomPct] = useState(agentState.investmentPercentage);
  const [customMaxPos, setCustomMaxPos] = useState(agentState.maxAvailablePositions);

  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(inputLimit);
    if (!isNaN(val) && val >= 0) {
      onConfigure({ minCapitalLimit: val });
      setEditingLimit(false);
    }
  };

  const handleCustomParamsSubmit = () => {
    onConfigure({
      investmentPercentage: Math.max(1, Math.min(100, customPct)),
      maxAvailablePositions: Math.max(1, Math.min(10, customMaxPos))
    });
  };

  const getHistoricalRangeLabel = () => {
    if (agentState.riskProfile === "CONSERVATIVE") return "Price Window: 1 Year (Lower volatility bias)";
    if (agentState.riskProfile === "INTERMEDIATE") return "Price Window: 6 Months (Balanced momentum bias)";
    return "Price Window: 3 Months (Aggressive scalp momentum)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 font-sans select-none"
    >
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-gray-200/60">
        <div>
          <h2 className="text-xl font-medium font-serif tracking-tight text-[#111827] flex items-center gap-2.5">
            <span className="p-1 px-1.5 rounded-lg bg-black text-[#ffffff]">
              <Sliders className="w-5 h-5 text-emerald-400" />
            </span>
            Core Strategy Calibration
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Fine-tune the risk matrices, peak thresholds scanning constraints, and available balance allocation controls.
          </p>
        </div>
        
        <button
          onClick={onResetAgent}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs text-gray-500 hover:text-black font-semibold font-mono transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Portfolio Balance</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column settings cards */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card A: Strategy Calibration (Risk Profile) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 text-black">
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 font-serif">1st Lever: Risk Profile Selection</h3>
                  <p className="text-[10px] text-gray-400 font-mono">ADJUST SCANNING WINDOW BASED ON STRATEGIC BIAS</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-black text-white px-2.5 py-1 rounded-lg">
                Active: {agentState.riskProfile}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 bg-gray-50 p-1.5 border border-gray-200/60 rounded-xl gap-2">
              {(["CONSERVATIVE", "INTERMEDIATE", "RISKY"] as const).map((profile) => (
                <button
                  key={profile}
                  onClick={() => onConfigure({ riskProfile: profile })}
                  className={`flex flex-col items-center justify-center py-4 rounded-lg text-xs font-mono tracking-wider transition-all uppercase cursor-pointer text-center ${
                    agentState.riskProfile === profile
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-400 hover:text-black hover:bg-white"
                  }`}
                >
                  <span className="font-bold text-xs">{profile === "CONSERVATIVE" ? "Conservador" : profile === "INTERMEDIATE" ? "Intermedio" : "Arriesgado"}</span>
                  <span className="text-[8px] whitespace-nowrap opacity-60 mt-0.5 font-sans">
                    {profile === "CONSERVATIVE" ? "1 Year Data Window" : profile === "INTERMEDIATE" ? "6 Month Data Window" : "3 Month Scalp Window"}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-700 font-mono uppercase">{getHistoricalRangeLabel()}</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  By adjusting the observation window, you restrict how far back the AI model looks for peak-to-valley candlestick anomalies on de-centralized pools. Shorter windows increase trading frequency but introduce secondary tail volatility.
                </p>
              </div>
            </div>
          </div>

          {/* Card B: Available Balance Preset and Sliders */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 text-black">
                  <Percent className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 font-serif">2nd Lever: Balance Investment Rule</h3>
                  <p className="text-[10px] text-gray-400 font-mono">DETERMINE MAXIMUM SIMULATED POOL ALLOCATION LIMITS</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                Preset: {agentState.investmentProfile}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 bg-gray-50 p-1.5 border border-gray-200/60 rounded-xl gap-2">
              {(["CONSERVATIVE", "BALANCED", "RISKY"] as const).map((profile) => (
                <button
                  key={profile}
                  onClick={() => {
                    onConfigure({ investmentProfile: profile });
                    if (profile === "CONSERVATIVE") {
                      setCustomPct(50);
                    } else if (profile === "BALANCED") {
                      setCustomPct(75);
                    } else if (profile === "RISKY") {
                      setCustomPct(100);
                    }
                  }}
                  className={`py-3.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer text-center ${
                    agentState.investmentProfile === profile
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-black hover:bg-white"
                  }`}
                >
                  {profile === "CONSERVATIVE" ? "Conservador (50%)" : profile === "BALANCED" ? "Balance (75%)" : "Arriesgado (100%)"}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-600 uppercase block">Single Trade Capital Use limit:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={customPct}
                      onChange={(e) => setCustomPct(Number(e.target.value))}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="font-mono font-bold text-sm text-gray-800 w-12 text-right">{customPct}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Proportion of initial balance allowed on a unique active trade position.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-600 uppercase block">Max Concurrent Trades:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={customMaxPos}
                      onChange={(e) => setCustomMaxPos(Number(e.target.value))}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="font-mono font-bold text-sm text-gray-800 w-12 text-right">{customMaxPos} pos</span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    The agent shuts down scanner intake if active positions match this quantity.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCustomParamsSubmit}
                className="w-full py-3 rounded-xl bg-black text-white text-xs font-mono font-bold uppercase hover:bg-black/95 cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Settings2 className="w-4 h-4 text-emerald-400" />
                Apply sliders & parameter adjustments
              </button>
            </div>
          </div>
        </div>

        {/* Right side information card column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card C: Capital protection trigger */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-serif font-medium">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Capital Net Protection Trigger</span>
            </div>
            
            <p className="text-[#6B7280] text-xs leading-relaxed">
              Define the absolute floor limit. If simulated asset portfolio decays to this balance trigger value, all trading operations fail-stop.
            </p>

            <div className="pt-2">
              {editingLimit ? (
                <form onSubmit={handleLimitSubmit} className="space-y-3">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
                    <span className="text-sm font-bold text-gray-400 font-mono">$</span>
                    <input
                      type="number"
                      value={inputLimit}
                      onChange={(e) => setInputLimit(e.target.value)}
                      className="bg-transparent border-none text-xs text-[#1F2937] focus:outline-none w-full font-mono font-bold"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 text-[10px] font-mono uppercase bg-black text-white py-2 rounded-lg cursor-pointer font-bold">
                      Confirm Save
                    </button>
                    <button type="button" onClick={() => setEditingLimit(false)} className="flex-1 text-[10px] font-mono text-gray-400 hover:text-black py-2 rounded-lg border border-gray-200 cursor-pointer text-center">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div 
                  onClick={() => {
                    setInputLimit(agentState.minCapitalLimit.toString());
                    setEditingLimit(true);
                  }}
                  className="bg-[#F9FAFB] hover:bg-gray-100/80 p-4 border border-dashed border-gray-200 rounded-xl text-center cursor-pointer transition-all space-y-1"
                >
                  <p className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-bold">Current absolute threshold</p>
                  <p className="text-2xl font-bold font-mono tracking-tight text-[#111827]">
                    ${agentState.minCapitalLimit.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-emerald-600 font-mono flex items-center justify-center gap-1">
                    <span>Click to calibrate trigger</span>
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center text-[9px] mb-1 font-mono uppercase tracking-wider text-gray-400 font-semibold">
                <span>Buffer safety status</span>
                <span className="text-emerald-600 font-bold">
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

          {/* Card D: Operational Execution mode switcher */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-serif font-medium">
              <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Execution Directive</span>
            </div>

            <p className="text-[#6B7280] text-xs leading-relaxed">
              Define the automated power bounds. Under <strong>Assisted (Supervisory)</strong>, scanned trading positions demand manual operator confirmation. Under <strong>Autopilot</strong>, trades deploy instantly.
            </p>

            <div className="flex flex-col gap-2 p-1 bg-gray-50 border border-gray-200/60 rounded-xl">
              {(["ASSISTED", "AUTOPILOT"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onConfigure({ executionMode: mode })}
                  className={`w-full py-2.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer text-center ${
                    agentState.executionMode === mode
                      ? mode === "AUTOPILOT"
                        ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                        : "bg-black text-white shadow-sm font-extrabold"
                      : "text-gray-450 hover:text-black hover:bg-white"
                  }`}
                >
                  {mode === "ASSISTED" ? "Supervisory (Assisted)" : "Autopilot (Automated)"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
