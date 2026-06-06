import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import ActiveSignals from "./components/ActiveSignals";
import AgentPanel from "./components/AgentPanel";
import CalibrationView from "./components/CalibrationView";
import ErrorBoundary from "./components/ErrorBoundary";
import HistoryView from "./components/HistoryView";
import LandingPage from "./components/LandingPage";
import OnboardingGuide from "./components/OnboardingGuide";
import PerformanceView from "./components/PerformanceView";
import Sidebar from "./components/Sidebar";
import VisualParserView from "./components/VisualParserView";
import WalkthroughTour from "./components/WalkthroughTour";
import { useAppState } from "./hooks/useAppState";

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
    handleApproveSwap,
    handleRejectSwap,
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

            {/* Interactive Step-by-Step Guided Walkthrough */}
            <WalkthroughTour
              currentView={currentView}
              setCurrentView={setCurrentView}
              agentIsOperating={agentState.isOperating}
              onToggleAgent={(operating) => handleConfigureAgent({ isOperating: operating })}
              onSetMode={(mode) => handleConfigureAgent({ executionMode: mode })}
            />

            {/* Operator Space Title Bar Breadcrumb Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 select-none">
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-2xl font-serif font-semibold text-[#111827]">Console</h1>
                
              </div>

              {/* Side helper grid controls */}
              <div className="flex items-center gap-2 ml-auto md:ml-0">
                
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
                  onApproveSwap={handleApproveSwap}
                  onRejectSwap={handleRejectSwap}
                  onResetAgent={handleResetAgent}
                  activeSignals={filteredSignals}
                  onCloseSignalEarly={handleCloseSignalEarly}
                />
              )}

              {currentView === "CALIBRATION" && (
                <CalibrationView
                  agentState={agentState}
                  onConfigure={handleConfigureAgent}
                  onResetAgent={handleResetAgent}
                />
              )}

              {currentView === "PARSER" && (
                <VisualParserView
                  isAnalyzing={isAnalyzing}
                  analysisStatus={analysisStatus}
                  analyzedResult={analyzedResult}
                  apiErrorMessage={apiErrorMessage}
                  dragActive={dragActive}
                  handleDrag={handleDrag}
                  handleDrop={handleDrop}
                  handleFileInput={handleFileInput}
                  setAnalyzedResult={setAnalyzedResult}
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
