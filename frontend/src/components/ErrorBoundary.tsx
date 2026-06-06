import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Terminal, ArrowUpRight, Copy, Check, Flame } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

/**
 * STRATEGY & FAULT TOLERANCE PATTERN: ERROR BOUNDARY
 * Retains pristine UI identity even during complete runtime structural failure.
 * Implements clean class-based catch mechanisms, provides deep memory visual traces,
 * and allows hot-rehydration of client status via localized state resets.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SignalAI Core Boundary Exception Intercepted:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    // Attempt local state rehydration
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    // Force standard navigation resync
    window.location.hash = "";
  };

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  private handleCopyLogs = () => {
    if (!this.state.error) return;
    const logText = `[SignalAI Error Logs]\nMessage: ${this.state.error.message}\nStack: ${this.state.error.stack}\nComponent Stack: ${this.state.errorInfo?.componentStack || "N/A"}`;
    
    navigator.clipboard.writeText(logText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(() => {});
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const blockHeight = Math.round(15894102 + (Date.now() / 2000) % 100000);

      return (
        <div 
          id="error-boundary-viewport" 
          className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#DCFCE7] select-none"
        >
          <div className="max-w-[620px] w-full bg-white rounded-[32px] border border-red-200/70 p-8 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
            {/* Visual Red Warning Highlight Strip */}
            <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-red-450 to-orange-450" />

            {/* Header Brand */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-mono font-bold text-sm tracking-tighter shadow-sm shrink-0">
                  S
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight text-[#1F2937] block">SignalAI</span>
                  <span className="text-[10px] block text-red-500 uppercase tracking-widest font-mono font-bold -mt-1">Process Fault Intercepted</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 font-mono bg-gray-50 border border-gray-150 px-2.5 py-1 rounded inline-block">
                Block #{blockHeight.toLocaleString()}
              </div>
            </div>

            {/* Error Graphic / Description */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#111827] tracking-tight leading-tight">
                  Cryptographic ledger connection interrupted
                </h1>
                <p className="text-gray-550 text-sm leading-relaxed">
                  The dashboard state engine suffered an unexpected mutation. Our decoupling guard caught this gracefully to protect active browser pipelines.
                </p>
              </div>
            </div>

            {/* Short Error Box */}
            <div className="bg-red-50/80 p-4 rounded-24 text-red-700/90 text-xs border border-red-200/55 flex flex-col font-mono relative overflow-hidden select-text text-left">
              <div className="text-[9px] uppercase font-bold text-red-600/80 tracking-widest mb-1.5 flex items-center gap-1.5 select-none">
                <Terminal className="w-3.5 h-3.5" />
                boundary panic signature
              </div>
              <span className="font-semibold break-all text-xs leading-normal">
                {this.state.error?.name || "RuntimeError"}: {this.state.error?.message || "Unknown State Thread Failure"}
              </span>
            </div>

            {/* Interactive Control Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-black hover:bg-black/90 active:scale-98 text-white py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-transparent"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rehydrate Software State</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="w-full bg-white hover:bg-gray-50 active:scale-98 text-red-600 font-mono font-bold hover:text-red-700 py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-red-250 hover:border-red-300 transition-all cursor-pointer shadow-sm"
              >
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Purge Cache & Hard Reset</span>
              </button>
            </div>

            {/* Expandable Diagnostic Code Logs */}
            <div className="border-t border-gray-150 pt-5">
              <div className="flex justify-between items-center text-xs">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-gray-500 hover:text-black font-semibold tracking-wider font-mono uppercase text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {this.state.showDetails ? "Collapse Call Stack" : "Explore Diagnostic Stack"}
                  <ArrowUpRight className={`w-3 h-3 transition-transform ${this.state.showDetails ? "rotate-45" : ""}`} />
                </button>

                {this.state.showDetails && (
                  <button
                    onClick={this.handleCopyLogs}
                    className="text-gray-400 hover:text-black font-mono text-[10px] flex items-center gap-1.5 cursor-pointer"
                    title="Copy log signature"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-bold">Copied Logs!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Logs</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {this.state.showDetails && (
                <div 
                  className="mt-4 p-4 rounded-2xl border border-gray-200 bg-gray-50/50 overflow-auto max-h-56 text-[10px] font-mono text-gray-600 text-left select-text scrollbar-thin whitespace-pre leading-normal leading-relaxed"
                  style={{ direction: 'ltr' }}
                >
                  <p className="font-bold text-red-500">Error stacktrace:</p>
                  <p className="break-all mt-1">{this.state.error?.stack || "No JS Callstack tracking active."}</p>
                  
                  {this.state.errorInfo && (
                    <>
                      <p className="font-bold text-gray-800 mt-4">Component mounting trace:</p>
                      <p className="break-all mt-1 text-gray-500">{this.state.errorInfo.componentStack}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
