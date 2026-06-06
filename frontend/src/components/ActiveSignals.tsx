import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TradeSignal, SignalType } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Shield,
  Search,
  PlusCircle,
  Sparkles,
  Compass,
} from "lucide-react";

interface ActiveSignalsProps {
  signals: TradeSignal[];
  onCreateSignal: (data: {
    token: string;
    signal: SignalType;
    confidence: number;
    pattern: string;
    price: number;
    targetPrice: number;
    stopLoss: number;
    timeframe: string;
    notes?: string;
  }) => void;
  isLoading: boolean;
}

/**
 * ACTIVE TRADE SIGNALS LIST
 * Provides real-time filtering, fast text matching, manual block creation drawer,
 * and high-fidelity layout item cards.
 */
export default function ActiveSignals({
  signals,
  onCreateSignal,
  isLoading,
}: ActiveSignalsProps) {
  const [filterType, setFilterType] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Operator broadcaster deck controls
  const [newToken, setNewToken] = useState("MONAD");
  const [newSignal, setNewSignal] = useState<SignalType>("BUY");
  const [newConfidence, setNewConfidence] = useState(0.85);
  const [newPattern, setNewPattern] = useState("Double Bottom");
  const [newPrice, setNewPrice] = useState(3.45);
  const [newTarget, setNewTarget] = useState(3.95);
  const [newStop, setNewStop] = useState(3.2);
  const [newTimeframe, setNewTimeframe] = useState("1H");
  const [newNotes, setNewNotes] = useState("");

  const activeSignals = useMemo(() => {
    return signals.filter((s) => s.status === "ACTIVE");
  }, [signals]);

  // Filter and search matching logic (Strategy/decoupling in component body)
  const filteredSignals = useMemo(() => {
    return activeSignals.filter((sig) => {
      const matchesFilter = filterType === "ALL" || sig.signal === filterType;
      const matchesSearch =
        sig.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sig.pattern.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeSignals, filterType, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent obvious mistakes at the UI boundary
    if (!newPattern.trim()) {
      return;
    }

    onCreateSignal({
      token: newToken.toUpperCase(),
      signal: newSignal,
      confidence: newConfidence,
      pattern: newPattern.trim(),
      price: Number(newPrice) || 1.0,
      targetPrice: Number(newTarget) || 1.1,
      stopLoss: Number(newStop) || 0.95,
      timeframe: newTimeframe,
      notes: newNotes.trim() || "Created manually via operator deck.",
    });

    // Reset & collapse deck drawer
    setNewNotes("");
    setShowAddForm(false);
  };

  // Provide smart dynamic pricing defaults when asset is switched
  const handleTokenChange = (val: string) => {
    const upperVal = val.toUpperCase();
    setNewToken(upperVal);
    if (upperVal === "MONAD") {
      setNewPrice(3.45);
      setNewTarget(3.95);
      setNewStop(3.2);
    } else if (upperVal === "ETH") {
      setNewPrice(3450.0);
      setNewTarget(3680.0);
      setNewStop(3350.0);
    } else if (upperVal === "BTC") {
      setNewPrice(97200.0);
      setNewTarget(102000.0);
      setNewStop(95000.0);
    } else if (upperVal === "SOL") {
      setNewPrice(185.3);
      setNewTarget(198.5);
      setNewStop(176.0);
    } else {
      setNewPrice(1.5);
      setNewTarget(1.8);
      setNewStop(1.35);
    }
  };

  return (
    <div id="active-signals-container" className="space-y-6 select-none">
      {/* Header element of Active list */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/50 pb-4">
        <div>
          <h2 className="text-xl font-medium font-serif tracking-tight text-text-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse"></span>
            Active Trade Signals Feed
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 text-text-secondary border border-gray-200/40 font-mono font-normal tracking-tight">
              {activeSignals.length} Live Targets
            </span>
          </h2>
          <p className="text-[#6B7280] text-xs mt-1 font-sans">
            Real-time pattern accuracy metrics mapped across active decentralized liquidity nodes.
          </p>
        </div>

        <button
          id="btn-toggle-add-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-black/90 active:scale-95 text-white font-mono tracking-wider text-[11px] uppercase transition-all shadow-sm cursor-pointer md:mt-0"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#4ADE80]" />
          {showAddForm ? "Close Operator Deck" : "Manual Broadcast Signal"}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -12 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="p-6 rounded-3xl border border-gray-200/60 bg-white shadow-sm font-sans"
          >
            <div className="flex items-center gap-2 text-[#111827] font-semibold mb-6 text-xs font-mono uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Broadcaster operator console directive trigger
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5 font-mono">
                  Token asset pair
                </label>
                <select
                  value={newToken}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:border-black transition-all"
                >
                  <option value="MONAD">MONAD</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="SOL">SOL</option>
                  <option value="CHOG">CHOG</option>
                  <option value="NADP">NADP</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5 font-mono">
                  Recommendation action
                </label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white p-0.5">
                  {(["BUY", "SELL", "HOLD"] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setNewSignal(dir)}
                      className={`flex-1 text-center py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        newSignal === dir
                          ? "bg-black text-white"
                          : "text-[#6B7280] hover:text-[#111827]"
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5 font-mono">
                  Confidence level ({Math.round(newConfidence * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(parseFloat(e.target.value))}
                  className="w-full accent-black py-2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5 font-mono">
                  Recognized Chart Pattern
                </label>
                <input
                  type="text"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  placeholder="e.g. Ascending Triangle"
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5 font-mono">
                  Target Price metrics ($)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                    placeholder="Entry"
                    required
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs text-[#1F2937] focus:outline-none focus:border-black transition-all"
                  />
                  <input
                    type="number"
                    step="any"
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseFloat(e.target.value))}
                    placeholder="Profit"
                    required
                    className="w-full bg-white border border-gray-205 rounded-lg px-2 py-2 text-xs text-[#1F2937] focus:outline-none focus:border-black transition-all"
                  />
                  <input
                    type="number"
                    step="any"
                    value={newStop}
                    onChange={(e) => setNewStop(parseFloat(e.target.value))}
                    placeholder="Stop"
                    required
                    className="w-full bg-white border border-gray-205 rounded-lg px-2 py-2 text-xs text-[#1F2937] focus:outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5 font-mono">
                  Timeframe epoch
                </label>
                <select
                  value={newTimeframe}
                  onChange={(e) => setNewTimeframe(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:border-black transition-all"
                >
                  <option value="5M">5 Min (Scalp)</option>
                  <option value="15M">15 Min (Intraday)</option>
                  <option value="1H">1 Hour (Swing)</option>
                  <option value="4H">4 Hour (Position)</option>
                  <option value="1D">1 Day (Macro)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5 font-mono">
                  Operator Technical Details
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Volumetric alignment metrics verified locally near support indicators"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#1F2937] placeholder:text-gray-300 focus:outline-none focus:border-black transition-all"
                />
              </div>

              <div className="md:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-black/90 text-white text-xs font-mono uppercase tracking-widest font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Broadcast New Target Signal
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Options and Interactive Search Field */}
      <div className="p-2.5 rounded-2xl border border-gray-200/50 bg-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex border border-gray-200/50 rounded-xl p-0.5 bg-gray-50/50 w-full md:w-auto">
          {(["ALL", "BUY", "SELL"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-[0.1em] font-mono transition-all flex-1 md:flex-initial text-center cursor-pointer ${
                filterType === type
                  ? "bg-black text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Target, Pattern Name..."
            className="w-full bg-gray-50 border border-gray-250 rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F2937] placeholder-gray-300 focus:outline-none focus:border-black/30 font-sans"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[#6B7280] font-mono text-xs tracking-wider">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-black mx-auto mb-4 opacity-50"></div>
          Syncing cryptographic ledger active feeds...
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-dashed border-gray-250 bg-white text-gray-400">
          <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4 whitespace-nowrap" />
          <p className="font-serif italic text-lg text-[#111827] font-medium">
            No live targets synced
          </p>
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#9CA3AF] mt-2 max-w-sm mx-auto leading-relaxed">
            Relax filters or submit a screenshot pattern to populate dynamic list entries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSignals.map((signal) => (
              <motion.div
                key={signal.id}
                layoutId={`card-${signal.id}`}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -12 }}
                transition={{ duration: 0.28, type: "spring", stiffness: 350, damping: 28 }}
                className={`p-6 rounded-3xl border bg-white relative overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300 ${
                  signal.signal === "BUY"
                    ? "border-emerald-200"
                    : signal.signal === "SELL"
                      ? "border-rose-200"
                      : "border-gray-205"
                }`}
              >
                {/* Horizontal side indicator highlight strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                    signal.signal === "BUY"
                      ? "bg-[#4ADE80]"
                      : signal.signal === "SELL"
                        ? "bg-rose-450"
                        : "bg-gray-400"
                  }`}
                />

                <div className="w-full">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-200/60 font-serif font-bold text-sm text-[#1F2937] select-none group-hover:scale-105 transition-transform">
                        {signal.token.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#1F2937] font-bold font-sans tracking-tight text-base">
                            {signal.token} / USDC
                          </span>
                          <span className="text-[#6B7280] text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200/50">
                            {signal.timeframes || "1H"}
                          </span>
                        </div>
                        <p className="text-[#6B7280] text-xs font-sans flex items-center gap-1.5 mt-1">
                          {signal.signal === "BUY" ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5 text-[11px] tracking-wide">
                              <TrendingUp className="w-3.5 h-3.5" />
                              Strong Buy bias
                            </span>
                          ) : signal.signal === "SELL" ? (
                            <span className="text-rose-500 font-semibold flex items-center gap-0.5 text-[11px] tracking-wide">
                              <TrendingDown className="w-3.5 h-3.5" />
                              Strong Sell allocation
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold flex items-center gap-0.5 text-[11px] tracking-wide">
                              Neutral Hold index
                            </span>
                          )}
                          <span className="text-gray-300">•</span>
                          <span className="text-[#4B5563] font-medium">{signal.pattern}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`text-[9px] px-2.5 py-0.5 rounded border font-bold font-mono tracking-wider ${
                          signal.signal === "BUY"
                            ? "text-emerald-700 border-accent-green/30 bg-accent-green-light"
                            : signal.signal === "SELL"
                              ? "text-rose-700 border-rose-300/30 bg-rose-50"
                              : "text-amber-700 border-amber-300/30 bg-amber-50"
                        }`}
                      >
                        {signal.signal}
                      </span>
                      <span className="text-[#9CA3AF] text-[9px] uppercase font-mono mt-2 tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(signal.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        UTC
                      </span>
                    </div>
                  </div>

                  {/* Progressive Confidence Match Accuracy Bar */}
                  <div className="my-5 bg-gray-50 p-4 rounded-2xl border border-gray-200/50">
                    <div className="flex justify-between items-center text-[9px] mb-2 font-mono uppercase tracking-wider">
                      <span className="text-[#6B7280]">predictive matching accuracy</span>
                      <span
                        className={`font-bold ${
                          signal.signal === "BUY"
                            ? "text-emerald-600"
                            : signal.signal === "SELL"
                              ? "text-rose-600"
                              : "text-amber-600"
                        }`}
                      >
                        {Math.round(signal.confidence * 100)}% Match rate
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          signal.signal === "BUY"
                            ? "bg-[#4ADE80]"
                            : signal.signal === "SELL"
                              ? "bg-rose-450"
                              : "bg-amber-400"
                        }`}
                        style={{ width: `${signal.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Level frames info box list */}
                  <div className="grid grid-cols-3 gap-2.5 py-1 text-center text-xs">
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-150">
                      <div className="text-[#9CA3AF] font-mono text-[9px] uppercase tracking-wider">
                        Entry price
                      </div>
                      <div className="text-[#1F2937] font-bold font-mono mt-1 text-xs">
                        $
                        {signal.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 3,
                        })}
                      </div>
                    </div>
                    <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-150">
                      <div className="text-[#4B5563] font-mono text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 select-none">
                        <Target className="w-3 h-3 text-[#4ADE80]" />
                        Profit Target
                      </div>
                      <span className="text-emerald-600 font-bold font-mono mt-1 text-xs">
                        $
                        {signal.targetPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 3,
                        })}
                      </span>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-150">
                      <div className="text-[#4B5563] font-mono text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 select-none">
                        <Shield className="w-3 h-3 text-rose-400" />
                        Protection
                      </div>
                      <span className="text-rose-500 font-bold font-mono mt-1 text-xs">
                        $
                        {signal.stopLoss.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 3,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Notes / description block */}
                  <p className="text-[#6B7280] text-[11px] leading-relaxed mt-4 bg-gray-50 p-3 rounded-2xl border border-gray-150 italic">
                    {signal.notes}
                  </p>
                </div>

                {/* Footer Monad transaction block details */}
                <div className="mt-5 pt-4 border-t border-gray-200/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 select-none w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
                    <span className="text-[9px] text-[#9CA3AF] uppercase tracking-widest font-mono">
                      MONAD TXN
                    </span>
                    <span className="text-[10px] text-[#4B5563] font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200/50 tracking-tighter">
                      {signal.txHash.substring(0, 16)}...
                    </span>
                  </div>

                  <a
                    href={`https://monadvision.xyz/tx/${signal.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#111827] hover:text-black font-mono tracking-widest uppercase flex items-center justify-end gap-1 font-bold transition-colors cursor-pointer"
                  >
                    verify block →
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
