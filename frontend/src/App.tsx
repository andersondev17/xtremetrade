import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Cpu,
  Grip,
  List,
  Calendar,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import ActiveSignals from "./components/ActiveSignals";
import Sidebar from "./components/Sidebar";
import PerformanceView from "./components/PerformanceView";
import HistoryView from "./components/HistoryView";
import { useAppState } from "./hooks/useAppState";
import ErrorBoundary from "./components/ErrorBoundary";
import AgentPanel from "./components/AgentPanel";
import LandingPage from "./components/LandingPage";
import OnboardingGuide from "./components/OnboardingGuide";

/**
 * MAIN PRESENTATIONAL COMPOSER LAYER
 * Fully decoupled from State synchronization, API networks, and Strategy Validations.
 * Renders high-end Apple-inspired elements, gapless grids, and fluid layout charts.
 */
export default function App() {
  const {
    signals,
    stats,
    agentState,
    isLoading,
    isAnalyzing,
    analysisStatus,
    analyzedResult,
    apiErrorMessage,
    dragActive,
    currentView,
    setCurrentView,
    setAnalyzedResult,
    refreshAllData,
    handleCreateCustomSignal,
    handleDrag,
    handleDrop,
    handleFileInput,
    handleConfigureAgent,
    handleApproveOpportunity,
    handleRejectOpportunity,
    handleCloseSignalEarly,
    handleResetAgent,
  } = useAppState();

  // Simulated browser routing synchronization (Landing Page on / vs Dashboard on /dashboard or #dashboard)
  const [route, setRoute] = useState<"landing" | "dashboard">(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    if (path === "/dashboard" || hash === "#dashboard") {
      return "dashboard";
    }
    return "landing";
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/dashboard" || h === "#dashboard") {
        setRoute("dashboard");
      } else {
        setRoute("landing");
      }
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  const navigateTo = (newRoute: "landing" | "dashboard") => {
    setRoute(newRoute);
    if (newRoute === "dashboard") {
      window.history.pushState(null, "", "#dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.history.pushState(null, "", "#");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Highlight initial sync on launch
  useEffect(() => {
    toast.info("Monad predictive engine syncing live. Mainnet simulator active.");
  }, []);

  const [currentBlock, setCurrentBlock] = useState(() =>
    Math.round(15894102 + (Date.now() / 2000) % 100000)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBlock(Math.round(15894102 + (Date.now() / 2000) % 100000));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Removed start & end dates completely per request.
  // We run metrics calculation directly on the live signals list for absolute newcomer clarity.
  const filteredSignals = signals;

  const filteredStats = useMemo(() => {
    const completed = filteredSignals.filter((s) => s.status === "COMPLETED");
    const totalSignals = filteredSignals.length;
    const completedSignals = completed.length;

    let winCount = 0;
    let totalPnl = 0;
    completed.forEach((s) => {
      if (s.result === "PROFIT") {
        winCount++;
      }
      if (s.pnl !== undefined) {
        totalPnl += s.pnl;
      }
    });

    const winRate = completedSignals > 0 ? Math.round((winCount / completedSignals) * 100) : stats.winRate;

    // Build the dynamic area points grouping progression
    const sortedCompleted = [...completed].sort((a, b) => a.timestamp - b.timestamp);
    let runningPnl = 0;
    const computedPnlHistory = sortedCompleted.map((s) => {
      if (s.pnl !== undefined) {
        runningPnl += s.pnl;
      }
      const dObj = new Date(s.timestamp);
      const dateStr = dObj.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
      return { date: dateStr, value: +runningPnl.toFixed(2) };
    });

    const finalPnlHistory = computedPnlHistory.length > 0 ? computedPnlHistory : (stats.pnlHistory.length > 0 ? stats.pnlHistory : [
      { date: "06-01", value: 5 },
      { date: "06-02", value: 12 },
      { date: "06-03", value: 18 },
      { date: "06-04", value: 24 },
      { date: "06-05", value: 38 },
      { date: "06-06", value: 48.2 }
    ]);

    return {
      winRate,
      totalSignals,
      completedSignals,
      totalPnl: totalPnl > 0 ? +totalPnl.toFixed(2) : stats.totalPnl,
      pnlHistory: finalPnlHistory,
      accuracyHistory: stats.accuracyHistory
    };
  }, [filteredSignals, stats]);

  // Memoize counts to prevent continuous filter array scan loops across intermediate renders
  const activeSignalsCount = useMemo(() => {
    return filteredSignals.filter((s) => s.status === "ACTIVE").length;
  }, [filteredSignals]);

  const completedSignalsCount = useMemo(() => {
    return filteredSignals.filter((s) => s.status === "COMPLETED").length;
  }, [filteredSignals]);

  // High quality bar distribution mappings matching original design curves
  const distributionBars = useMemo(() => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      bars.push({ height: 25 + Math.random() * 30, type: "stable", delay: i * 0.01 });
    }
    for (let i = 0; i < 18; i++) {
      bars.push({ height: 50 + Math.random() * 45, type: "yield", delay: 0.2 + i * 0.01 });
    }
    for (let i = 0; i < 17; i++) {
      bars.push({ height: 18 + Math.random() * 25, type: "transient", delay: 0.38 + i * 0.01 });
    }
    return bars;
  }, []);

  const getBarColor = (type: string) => {
    switch (type) {
      case "stable":
        return "#1F2937";
      case "yield":
        return "#4ADE80";
      case "transient":
        return "#D1D5DB";
      default:
        return "#E5E7EB";
    }
  };

  if (route === "landing") {
    return (
      <LandingPage onEnterDashboard={() => navigateTo("dashboard")} />
    );
  }

  return (
    <div
      id="signalai-layout-container"
      className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-[#DCFCE7] flex flex-col lg:flex-row"
    >
      {/* SHADCN SONNER TOASTER REGISTERED GLOBALLY */}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#000000",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "16px",
            fontFamily: "Space Grotesk, Inter, sans-serif",
          },
          classNames: {
            toast: "bg-black text-white border border-white/15 rounded-2xl p-4 font-mono shadow-2xl",
            title: "text-white font-bold text-xs font-mono tracking-tight",
            description: "text-gray-400 text-[10px] mt-1 font-sans",
            success: "border-emerald-500/30 text-emerald-400",
            error: "border-rose-500/30 text-rose-400",
            info: "border-sky-500/30 text-sky-400",
          }
        }}
        closeButton
      />

      {/* LEFT MODULAR SIDEBAR */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeSignalsCount={activeSignalsCount}
        completedSignalsCount={completedSignalsCount}
        winRate={filteredStats.winRate}
        currentBlock={currentBlock}
        onRefresh={refreshAllData}
        agentIsOperating={agentState.isOperating}
        onBackToLanding={() => navigateTo("landing")}
      />

      {/* RIGHT MAIN OPERATIONS DECK */}
      <div className="flex-1 min-h-screen px-4 lg:px-8 py-8 overflow-y-auto">
        <div className="max-w-[1120px] mx-auto">
          <ErrorBoundary>
            <main id="dashboard-body-main" className="mt-0">
            {/* Operator Onboarding Guide for First-time users */}
            <OnboardingGuide 
              onStartAutonomous={() => {
                setCurrentView("AGENT");
                handleConfigureAgent({ isOperating: true });
                toast.success("Autopilot turned on! Swapped to autonomous agent mode.");
              }}
              onUploadClick={() => {
                const el = document.getElementById("chart-upload-file");
                if (el) {
                  el.click();
                } else {
                  toast.error("Screenshot input node not found.");
                }
              }}
            />

            {/* Operator Space Title Bar Breadcrumb Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 select-none">
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-2xl font-serif font-semibold text-[#111827]">Console</h1>
                <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono">
                  <span className="w-1.5 h-1.5 bg-gray-350 rounded-sm"></span>
                  <span>operator space</span>
                  <span className="text-gray-300">/</span>
                  <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
                  <span className="text-text-secondary">active intelligence</span>
                </div>
              </div>

              {/* Presentational View Tab Sliders */}
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200/40">
                {(["AGENT", "FEED", "ANALYTICS", "HISTORY"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className="relative px-5 py-1.5 text-xs uppercase tracking-wider font-mono font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {currentView === view && (
                      <motion.div
                        layoutId="activeSubTab"
                        className="absolute inset-0 bg-black rounded-lg"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        currentView === view
                          ? "text-white"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {view === "AGENT"
                        ? "Autonomous Agent"
                        : view === "FEED"
                          ? "Live Feed"
                          : view === "ANALYTICS"
                            ? "Performance"
                            : "Archived Logs"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Side helper grid controls */}
              <div className="flex items-center gap-2 ml-auto md:ml-0">
                <button
                  onClick={refreshAllData}
                  className="p-2 bg-white rounded-lg border border-gray-100 text-gray-500 hover:text-text-primary shadow-sm active:scale-95 transition-all cursor-pointer"
                  title="Manual re-sync feeds"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white rounded-lg border border-gray-150 text-gray-400 shadow-sm cursor-help">
                  <Grip className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white rounded-lg border border-gray-150 text-gray-400 shadow-sm cursor-help">
                  <List className="w-4 h-4" />
                </button>

                <div className="flex items-center bg-black text-white pl-3 pr-1.5 py-1.5 rounded-lg ml-2 shadow-sm font-mono text-[11px]">
                  <span className="font-bold mr-1.5">
                    +{activeSignalsCount} EXECUTING
                  </span>
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/80 border border-black flex items-center justify-center font-bold text-[8px]">
                      B
                    </div>
                    <div className="w-4 h-4 rounded-full bg-violet-500/80 border border-black flex items-center justify-center font-bold text-[8px]">
                      E
                    </div>
                    <div className="w-4 h-4 rounded-full bg-amber-500/80 border border-black flex items-center justify-center font-bold text-[8px]">
                      M
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apple Styled Display Hero Banner section */}
            <section className="mb-12 py-12 border-b border-gray-200/75 max-w-6xl mx-auto text-center font-sans">
              <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-tight text-text-primary leading-tight max-w-5xl mx-auto">
                Decentralized predictive logic{" "}
                <span
                  className="inline-block w-20 h-7 rounded-full align-middle bg-cover bg-center border border-gray-200 mx-1 shadow-sm select-none"
                  style={{ backgroundImage: 'url("https://picsum.photos/seed/monad/240/120")' }}
                ></span>{" "}
                mapped across active liquid pools.
              </h1>
              <p className="text-[#4B5563] text-sm font-sans mt-5 max-w-2xl mx-auto leading-relaxed">
                Empowered by vision pattern scanning on decentralized technical charts. Submit visual screenshots below to verify pattern matching confidence rates.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <a
                  href="#active-signals-container"
                  className="px-6 py-2.5 bg-black hover:bg-black/95 text-[#FFFFFF] font-semibold rounded-full text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Feed <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    const el = document.getElementById("chart-upload-file");
                    if (el) el.click();
                  }}
                  className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-gray-50 text-text-primary border border-gray-200 font-semibold rounded-full text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                >
                  Verify Screenshot Pattern
                </button>
              </div>
            </section>

            {/* Gapless Mathematically Perfect Bento Grid Blocks */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-12">
              {/* Card 1: Multimodal Vision Upload parser (4 / 12) */}
              <div className="lg:col-span-4 bg-[#FFFFFF] p-6 rounded-3xl border border-gray-200/50 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    multimodal visual parser
                  </h3>
                  <span className="text-[10px] text-text-tertiary font-mono bg-gray-50 px-2.5 py-0.5 rounded border border-gray-100">
                    AI Active
                  </span>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`aspect-[4/3] w-full rounded-2xl border border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 relative ${
                    dragActive
                      ? "border-black bg-gray-50"
                      : isAnalyzing
                        ? "border-amber-400 bg-amber-50/20"
                        : "border-gray-200/80 hover:border-black hover:bg-gray-50/50"
                  }`}
                >
                  <input
                    type="file"
                    id="chart-upload-file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <label
                    htmlFor="chart-upload-file"
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer absolute inset-0 p-4"
                  >
                    {isAnalyzing ? (
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto border border-amber-200">
                          <Cpu className="w-5 h-5 text-amber-500 animate-spin" />
                        </div>
                        <p className="text-xs font-semibold text-text-primary">
                          Scanning Candle Geometry...
                        </p>
                        <p className="text-[10px] text-amber-600 font-mono italic max-w-[170px] mx-auto truncate text-center leading-relaxed">
                          {analysisStatus}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto group-hover:scale-105 transition-all">
                          <Upload className="w-5 h-5 text-black" />
                        </div>
                        <p className="text-xs font-semibold text-[#1F2937]">
                          Submit Trading Chart
                        </p>
                        <p className="text-[10px] text-text-secondary leading-relaxed max-w-[200px] mx-auto">
                          Drop screenshot here to query real-time patterns with Gemini visual proxy
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {apiErrorMessage && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2 select-none">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{apiErrorMessage}</span>
                  </div>
                )}
              </div>

              {/* Card 2: On-Chain Pool Accuracy Distribution mapping (5 / 12) */}
              <div className="lg:col-span-5 bg-[#FFFFFF] p-6 rounded-3xl border border-gray-200/50 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6 select-none">
                  <div>
                    <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-mono">
                      Monad pool accuracy distribution
                    </h3>
                    <div className="text-[9px] text-text-secondary font-sans mt-0.5">
                      Statistical deviation categorized across historic trades
                    </div>
                  </div>
                  <button className="p-1 px-2.5 bg-gray-100 border border-gray-200/40 hover:bg-gray-150 text-[10px] text-text-primary rounded-lg font-mono cursor-help">
                    Live Logs
                  </button>
                </div>

                <div className="absolute top-20 left-6 text-[10px] text-text-secondary leading-tight pointer-events-none select-none">
                  Stable Profit Ratio
                  <br />
                  <span className="font-bold text-text-primary text-base">52%</span>
                </div>
                <div className="absolute top-36 left-[41%] text-[10px] text-emerald-600 leading-tight pointer-events-none select-none">
                  High Yield Target
                  <br />
                  <span className="font-bold text-emerald-500 text-base">18%</span>
                </div>
                <div className="absolute top-36 left-[72%] text-[10px] text-gray-500 leading-tight pointer-events-none select-none">
                  Transient Drops
                  <br />
                  <span className="font-bold text-gray-700 text-base">30%</span>
                </div>

                {/* Micro block height elements bar stage */}
                <div className="h-[140px] w-full flex items-end justify-between gap-[2px] pt-8 z-10 relative">
                  {distributionBars.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${b.height}%` }}
                      transition={{ duration: 0.5, delay: b.delay, ease: "easeOut" }}
                      className="w-[3px] rounded-t-full hover:scale-110 transition-transform cursor-pointer relative group"
                      style={{ backgroundColor: getBarColor(b.type) }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-mono">
                        {Math.floor(b.height * 10)} epoch
                      </div>
                    </motion.div>
                  ))}

                  <div className="absolute bottom-0 left-[36%] w-[28%] h-4 bg-accent-green/30 opacity-70 blur-[2px] pointer-events-none"></div>
                </div>

                {/* X Axis indicator markers */}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-[9px] text-text-tertiary font-mono tracking-widest mt-2 uppercase select-none">
                  <span>Epoch #1</span>
                  <span>Epoch #4</span>
                  <span>Epoch #8</span>
                  <span>Epoch #12</span>
                  <span>Epoch #16</span>
                </div>
              </div>

              {/* Card 3: Realtime Event Sync indicator tickers (3 / 12) */}
              <div className="lg:col-span-3 bg-[#FFFFFF] p-6 rounded-3xl border border-gray-200/50 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="flex justify-between items-center mb-4 select-none">
                  <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-mono">
                    real-time block syncer
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
                </div>

                <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs border-b border-gray-105 pb-2">
                    <span className="font-mono text-text-secondary flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-1.5 bg-text-primary rounded-full"></span>
                      Txn verified
                    </span>
                    <span className="text-[#02c385] bg-emerald-500/10 px-1 rounded font-bold font-mono text-[10px]">
                      +{filteredStats.winRate}% Match
                    </span>
                    <span className="text-text-tertiary font-mono text-[10px] select-none">now</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-gray-105 pb-2">
                    <span className="font-mono text-text-secondary flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-1.5 bg-text-primary rounded-full"></span>
                      Pool checked
                    </span>
                    <span className="text-text-primary font-bold font-mono text-[11px]">v1-dev</span>
                    <span className="text-text-tertiary font-mono text-[10px] select-none">10s</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-gray-105 pb-2">
                    <span className="font-mono text-text-secondary flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-1.5 bg-text-primary rounded-full"></span>
                      Epoch synced
                    </span>
                    <span className="text-text-primary font-bold font-mono text-[11px]">
                      #{currentBlock % 1000}
                    </span>
                    <span className="text-text-tertiary font-mono text-[10px] select-none">12s</span>
                  </div>
                </div>

                <div className="mt-4 pt-1 font-mono text-[10px] text-text-secondary flex justify-between items-center select-none">
                  <span>Current Monad Block:</span>
                  <span className="font-semibold text-text-primary bg-gray-100 border border-gray-250 px-2 py-0.5 rounded">
                    #{currentBlock.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* Extended total dynamic volume banner statistics */}
            <section className="mb-12 bg-white p-8 rounded-3xl border border-gray-200/50 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2 font-mono">
                    Monad Active Pool Volume Indicators
                  </h3>
                  <div className="text-5xl sm:text-7xl font-sans font-bold tracking-tight text-text-primary leading-none flex items-baseline select-none">
                    122,872,<span className="text-gray-300">{(currentBlock % 1000).toString().padStart(3, "0")}</span>
                    <span className="text-xs font-mono font-normal tracking-wide text-text-secondary uppercase border border-gray-250 rounded-full px-2.5 py-0.5 bg-gray-50 ml-3 shrink-0">
                      Sync tick rate active
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs mt-3 select-none">
                    Calculated over real-time liquidity pools activity feeds on Monad devnet.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 font-mono text-[10px] text-text-secondary">
                  <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-150">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Epoch Rate: <strong>12.4 txn / sec</strong></span>
                  </div>
                  <span className="text-text-tertiary">All values syncing across liquid nodes...</span>
                </div>
              </div>
            </section>

            {/* AI Vision multimodal verdict result showcase panel */}
            <AnimatePresence>
              {analyzedResult && (
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="mb-12 p-8 bg-white rounded-3xl border border-black/10 shadow-sm relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-[#1F2937] uppercase tracking-widest bg-gray-100 border border-gray-250 px-2.5 py-1 rounded inline-block">
                        AI Multimodal Vision Verdict
                      </div>
                      <h2 className="text-2xl font-serif font-semibold text-text-primary mt-2">
                        Pattern found: {analyzedResult.pattern}
                      </h2>
                    </div>
                    <button
                      onClick={() => setAnalyzedResult(null)}
                      className="px-3 py-1 bg-gray-105 hover:bg-gray-200 text-xs font-mono font-bold text-text-primary border border-gray-200 rounded-lg cursor-pointer"
                    >
                      Dismiss Verdict
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between select-none">
                      <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider">
                        Matched Asset
                      </span>
                      <p className="text-xl font-bold text-text-primary mt-2">
                        {analyzedResult.token}/USDC
                      </p>
                      <span className="text-[10px] text-text-secondary font-mono italic mt-1 font-semibold">
                        confidence: {Math.round(analyzedResult.confidence * 100)}%
                      </span>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider select-none">
                        Signal Recommendation
                      </span>
                      <p
                        className={`text-xl font-bold mt-2 ${
                          analyzedResult.signal === "BUY" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {analyzedResult.signal}
                      </p>
                      <span className="text-[10px] text-text-secondary font-mono mt-1 select-none">
                        timeframe: {analyzedResult.timeframe}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2 flex flex-col justify-between">
                      <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider select-none">
                        Identified Operational Limits
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 bg-white p-3 rounded-xl border border-gray-200 font-mono">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-text-tertiary">
                            Entry Price
                          </p>
                          <p className="font-bold text-text-primary mt-0.5">
                            ${analyzedResult.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#10b981]">
                            Target Profit
                          </p>
                          <p className="font-bold text-[#10b981] mt-0.5">
                            ${analyzedResult.targetPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-rose-500">
                            Stop Loss
                          </p>
                          <p className="font-bold text-rose-500 mt-0.5">
                            ${analyzedResult.stopLoss}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-1">
                      Detailed Technical Grounding:
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed font-sans">
                      {analyzedResult.explanation}
                    </p>

                    {analyzedResult.indicators && analyzedResult.indicators.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 select-none">
                        {analyzedResult.indicators.map((ind, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-mono bg-white text-text-secondary px-2.5 py-0.5 rounded-md border border-gray-150"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Active view component layers rendering */}
            <div className="mt-4">
              {currentView === "AGENT" && (
                <AgentPanel
                  agentState={agentState}
                  onConfigure={handleConfigureAgent}
                  onApproveOpportunity={handleApproveOpportunity}
                  onRejectOpportunity={handleRejectOpportunity}
                  onResetAgent={handleResetAgent}
                  activeSignals={filteredSignals}
                  onCloseSignalEarly={handleCloseSignalEarly}
                />
              )}

              {currentView === "FEED" && (
                <div className="space-y-6">
                  <ActiveSignals
                    signals={filteredSignals}
                    onCreateSignal={handleCreateCustomSignal}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {currentView === "ANALYTICS" && <PerformanceView stats={filteredStats} />}

              {currentView === "HISTORY" && <HistoryView signals={filteredSignals} />}
            </div>
            </main>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
