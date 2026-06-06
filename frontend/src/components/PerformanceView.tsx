import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { PerformanceStats } from "../types";

const DEFAULT_PNL_HISTORY = [
  { date: "06-01", value: 5 },
  { date: "06-02", value: 12 },
  { date: "06-03", value: 18 },
  { date: "06-04", value: 24 },
  { date: "06-05", value: 38 },
  { date: "06-06", value: 48.2 }
];

interface PerformanceViewProps {
  stats: PerformanceStats;
}

export default function PerformanceView({ stats }: PerformanceViewProps) {
  // Simple Income representation columns (statically cached or memoized per instance)
  const incomeBars = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      let h = 30 + Math.random() * 40;
      if (i === 8) h = 85; 
      return { height: h, isHighlight: i === 8 };
    });
  }, []);

  return (
    <div id="performance-view-tab" className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-gray-200/50 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-serif font-semibold text-text-primary">System Performance Metrics</h2>
            <p className="text-text-secondary text-xs mt-1">Algorithmic accuracy tracked over Monad smart contract executions.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 text-center min-w-[120px]">
              <span className="text-[9px] font-mono uppercase text-text-tertiary">Overall Win Rate</span>
              <p className="text-2xl font-serif font-bold text-[#10b981] mt-1">{stats.winRate}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 text-center min-w-[120px]">
              <span className="text-[9px] font-mono uppercase text-[#9ca3af]">Captured PnL</span>
              <p className="text-2xl font-serif font-bold text-text-primary mt-1">+{stats.totalPnl}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 text-center min-w-[120px]">
              <span className="text-[9px] font-mono uppercase text-[#9ca3af]">Total Signals</span>
              <p className="text-2xl font-serif font-bold text-text-primary mt-1">{stats.totalSignals}</p>
            </div>
          </div>
        </div>

        {/* Area Chart representation */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.pnlHistory && stats.pnlHistory.length > 0 ? stats.pnlHistory : DEFAULT_PNL_HISTORY}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pnlGlowColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#E5E7EB" 
                tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "JetBrains Mono" }} 
              />
              <YAxis 
                stroke="#E5E7EB" 
                tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "JetBrains Mono" }} 
              />
              <Tooltip 
                contentStyle={{ background: "#FFFFFF", borderColor: "#E5E7EB", borderRadius: 12, color: "#111827" }}
                labelStyle={{ color: "#9CA3AF", fontFamily: "JetBrains Mono", fontSize: 10 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#4ADE80" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#pnlGlowColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom double bento-grids corresponding to DeviceTraffic and Income */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DeviceTraffic replica */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/50 shadow-sm h-[260px] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-mono">active target accuracy rates</h3>
            <div className="flex gap-2">
              <span className="text-[9px] text-[#9ca3af] font-mono">Real-Time</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative mt-2 select-none pointer-events-none">
            <div className="relative w-[180px] h-[90px] overflow-hidden">
              <svg width="180" height="180" viewBox="0 0 180 180" className="rotate-[180deg]">
                {/* Track background */}
                <circle
                  cx="90"
                  cy="90"
                  r="72"
                  fill="transparent"
                  stroke="#E5E7EB"
                  strokeWidth="14"
                  strokeDasharray={`${72 * 2 * Math.PI}`}
                  strokeDashoffset={`${(72 * 2 * Math.PI) * 0.5}`}
                  className="opacity-50"
                />
                {/* Accent green circle segment */}
                <circle
                  cx="90"
                  cy="90"
                  r="72"
                  fill="transparent"
                  stroke="#4ADE80"
                  strokeWidth="14"
                  strokeDasharray={`${72 * 2 * Math.PI}`}
                  strokeDashoffset={`${(72 * 2 * Math.PI) - (((72 * 2 * Math.PI) / 2) * (stats.winRate / 100))}`}
                />
              </svg>
              <div className="absolute bottom-0 left-0 w-full text-center pb-1">
                <div className="text-2xl font-bold text-text-primary">{stats.winRate}%</div>
                <div className="text-[10px] text-text-tertiary font-mono">devnet target winrate</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-[10px] font-semibold text-text-secondary font-mono">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span> profitable ({stats.winRate}%)
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> stop loss ({100 - stats.winRate}%)
            </div>
          </div>
        </div>

        {/* Simple Income representation columns */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/50 shadow-sm h-[260px] flex flex-col justify-between relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider font-mono">signal accuracy historic ticks</h3>
            <span className="text-[9px] text-[#10b981] font-mono leading-none font-semibold">Active Benchmark</span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-[3px]">
            {incomeBars.map((bar, i) => (
              <div key={i} className="relative w-full h-full flex items-end group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.015 }}
                  className={`w-full rounded-md transition-all duration-350 ${
                    bar.isHighlight ? "bg-black" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                />
                {bar.isHighlight && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-black text-white text-[9px] font-mono font-medium py-1 px-2 rounded-md whitespace-nowrap z-25 shadow-lg"
                  >
                    {stats.winRate}% Win High Point
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-transparent border-t-black"></div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
